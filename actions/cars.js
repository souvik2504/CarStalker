"use server";

import { serializeCarData } from "@/lib/helpers";
import { db } from "@/lib/prisma";
import { createClient } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

async function fileToBase64(file){
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    return buffer.toString("base64");
}

export async function processCarImageWithAI(file){
    try 
    {
        if (!process.env.GEMINI_API_KEY)
        {
            throw new Error("Gemini API key is noot configured");
        }

       const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
       const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

       const base64Image = await fileToBase64(file);

       const imagePart = 
       {
            inlineData:{
            data: base64Image,
            mimeType: file.type,
       },
    };
        const prompt = `
        Analyze this car image and extract the following information:
      1. Make (manufacturer)
      2. Model
      3. Year (approximately)
      4. Color
      5. Body type (SUV, Sedan, Hatchback, etc.)
      6. Mileage
      7. Fuel type (your best guess)
      8. Transmission type (your best guess)
      9. Price (your best guess)
      10. Short Description as to be added to a car listing

      Format your response as a clean JSON object with these fields:
      {
        "make": "",
        "model": "",
        "year": 0000,
        "color": "",
        "price": "",
        "mileage": "",
        "bodyType": "",
        "fuelType": "",
        "transmission": "",
        "description": "",
        "confidence": 0.0
      }

      For confidence, provide a value between 0 and 1 representing how confident you are in your overall identification.
      Only respond with the JSON object, nothing else.
    `;

    const result = await model.generateContent([imagePart,prompt]);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    try {
        const carDetails = JSON.parse(cleanedText);

        const requiredFields =[
            "make",
        "model",
        "year",
        "color",
        "bodyType",
        "price",
        "mileage",
        "fuelType",
        "transmission",
        "description",
        "confidence",
        ];

        const missingFields = requiredFields.filter(
            (field) => !(field in carDetails)
        );

        if (missingFields.length > 0) {
            throw new Error(
              `AI response missing required fields: ${missingFields.join(", ")}`
            );
          }
    
          return {
            success: true,
            data: carDetails,
          };
    } catch (error) {
        console.error("Failed to parse AI response:", parseError);
        console.log("Raw response:", text);
        return {
        success: false,
        error: "Failed to parse AI response",
      };
    }

    } catch (error) {
        throw new Error("Gemini API error:" + error.message);
    }
}

export async function addCar({carData, images}){
  try {
    const { userId} = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: {clerkUserId: userId},
    });

    if (!user) throw new Error ("Use not fond");

    const carId = uuidv4();
    const folderPath = `cars/${carId}`;

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const imageUrls = [];

    for (let i=0; i<images.length; i++){
      const base64Data = images[i];

      if(!base64Data || !base64Data.startsWith("data:image/")){
        console.warn("Skipping invalid image data");
        continue;
      }

      const base64 = base64Data.split(",")[1];
      const imageBuffer = Buffer.from(base64, "base64");

      const mimeMatch = base64Data.match(/data:image\/([a-zA-z0-9]+);/);
      const fileExtension = mimeMatch ? mimeMatch[1] : "jpeg";

      const fileName = `image-${Date.now()}-${i}.${fileExtension}`;
      const filePath = `${folderPath}/${fileName}`;

      const {data, error} = await supabase.storage.from("car-images").upload(filePath,imageBuffer, {
        contentType: `image/${fileExtension}`,
      })
        if(error){
          console.error("Error uploadin image:",error);
          throw new Error(`Faild to upload image: ${error.message}`);
        }

        const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/car-images/${filePath}`;

        imageUrls.push(publicUrl);
    }

    if (imageUrls.length === 0){
      throw new Error ("No valid images were uploaded");
    }

    const car =  await db.car.create({
      data: {
        id: carId, // Use the same ID we used for the folder
        make: carData.make,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        mileage: carData.mileage,
        color: carData.color,
        fuelType: carData.fuelType,
        transmission: carData.transmission,
        bodyType: carData.bodyType,
        seats: carData.seats,
        description: carData.description,
        status: carData.status,
        featured: carData.featured,
        images: imageUrls, // Store the array of image URLs
      },
    });

    revalidatePath("/admin/cars")

    return{
      success: true,
    };
  } catch (error) {
    throw new Error("Error adding car: "+error.message);
  }
}

export async function getCars(search ="") {
  try {
    
    const {userId} = await auth();
    if(!userId) throw new Error ("Unauthorized");

    const user = await db.user.findUnique({
      where: {clerkUserId: userId},
    });

    if(!user) throw new Error ("User not found");

    let where = {};

    // Add search filter
    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    const cars = await db.car.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const serializedCars = cars.map(serializeCarData);

    return {
      success: true,
      data: serializedCars,
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function deleteCar(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // First, fetch the car to get its images
    const car = await db.car.findUnique({
      where: { id },
      select: { images: true },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Delete the car from the database
    await db.car.delete({
      where: { id },
    });

    // Delete the images from Supabase storage
    try {
      const cookieStore = cookies();
      const supabase = createClient(cookieStore);

      // Extract file paths from image URLs
      const filePaths = car.images
        .map((imageUrl) => {
          const url = new URL(imageUrl);
          const pathMatch = url.pathname.match(/\/car-images\/(.*)/);
          return pathMatch ? pathMatch[1] : null;
        })
        .filter(Boolean);

      // Delete files from storage if paths were extracted
      if (filePaths.length > 0) {
        const { error } = await supabase.storage
          .from("car-images")
          .remove(filePaths);

        if (error) {
          console.error("Error deleting images:", error);
          // We continue even if image deletion fails
        }
      }
    } catch (storageError) {
      console.error("Error with storage operations:", storageError);
      // Continue with the function even if storage operations fail
    }

    // Revalidate the cars list page
    revalidatePath("/admin/cars");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting car:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function updateCarStatus(id, { status, featured }){

    try {
      const { userId} = await auth();
      if (!userId) throw new Error("Unauthorized");
  
      const user = await db.user.findUnique({
        where: {clerkUserId: userId},
      });
  
      if (!user) throw new Error ("Use not fond");

      const updateData = {}

      if (status !== undefined) {
        updateData.status = status;
      }
  
      if (featured !== undefined) {
        updateData.featured = featured;
      }

      // Update the car
      await db.car.update({
        where: { id },
        data: updateData,
      });

      // Revalidate the cars list page
      revalidatePath("/admin/cars");

      return {
        success: true,
      };
    } catch (error) {
      console.error("Error updating car status:", error);
    return {
      success: false,
      error: error.message,
    };
    }

}