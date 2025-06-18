
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "./ui/card";
import Image from "next/image";
import { CarIcon, Heart, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { toggleSavedCar } from "@/actions/car-listing";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";
import useFetch from "@/hooks/use-fetch";

const CarCard = ({car}) => {

    // const [isSaved, setisSaved] = useState(car.wishlisted);
    const [isSaved, setisSaved] = useState(car.wishlisted);
    useEffect(() => {
      setisSaved(car.wishlisted);
    }, [car.wishlisted]);
    

    const router = useRouter();
    const { isSignedIn } = useAuth();

    // Use the useFetch hook
    const {
        loading: isToggling,
        fn: toggleSavedCarFn,
        data: toggleResult,
        error: toggleError,
    } = useFetch(toggleSavedCar);

    // Handle toggle result with useEffect
    useEffect(() => {
        if (toggleResult?.success && toggleResult.saved !== isSaved) {
        setisSaved(toggleResult.saved);
        toast.success(toggleResult.message);
        }
    }, [toggleResult, isSaved]);

   
    
    useEffect(() => {
        if (toggleError) {
          toast.error("Failed to update favorites");
        }
      }, [toggleError]);

    const handleToggleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isSignedIn) {
        toast.error("Please sign in to save cars");
        router.push("/sign-in");
        return;
        }

        if (isToggling) return;

        // Call the toggleSavedCar function using our useFetch hook
        await toggleSavedCarFn(car.id);
    };

    return <Card className="overflow-hidden hover:shadow-lg transition group py-0">
        <div className="relative h-70">
            {car.images && car.images.length > 0?(
            <div className="relative w-full h-full">
                <Image src={car.images[0]}alt={`${car.make} ${car.model}`}fill 
                className="object-cover group-hover:scale-105 transition-300"
                />
            </div>
        ):(
            <div>
                <CarIcon className="h-12 w-12 text-gray-400" />
            </div>
            )}
             <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 rounded-full p-1.5 ${
            isSaved
              ? "text-red-500 hover:text-red-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={handleToggleSave}
          disabled={isToggling}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart
  size={20}
  className={`transition ${
    isSaved ? "fill-red-500 stroke-red-500" : "stroke-gray-600"
  }`}
/>

          )}
        </Button>
        </div>

        <CardContent className="p-4">
            <div className="flex flex-col mb-2">
                <h3 className="flex-lg font-bold line-clamp-1">
                    {car.make} {car.model}
                </h3>
                <span className="text-xl font-bold text-blue-600">
                ₹{car.price.toLocaleString("en-US") || "N/A"}
                    
                </span>
            </div>

            <div className="text-gray-600 mb-2 flex items-center">
                <span>{car.year}</span>
                <span className="mx-2">.</span>
                <span>{car.transmission}</span>
                <span className="mx-2">.</span>
                <span>{car.fuelType}</span>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
                <Badge variant="outline" className="bg-white-100">
                    {car.bodyType}
                </Badge>
                <Badge variant="outline" className="bg-white-500">
                    {car.mileage.toLocaleString() || "N/A"} miles
                </Badge>
                <Badge variant="outline" className="bg-white-500">
                    {car.color}                    
                </Badge>
            </div>

            <div className="flex justify-between">
                <Button className="flex-1"
                    onClick={()=> router.push(`/cars/${car.id}`)}>
                        View car
                </Button>
            </div>
        </CardContent>


    </Card>;
};

export default CarCard;