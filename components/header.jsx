import { SignedIn, SignedOut, SignIn, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async ({ isAdminPage = false }) => {

  const user = await checkUser();

  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b shadow-sm">
      <nav className="mx-auto px-4 py-2 flex items-center justify-between">
        {/* Left Side - Logo */}
        <Link href={isAdminPage ? "/admin" : "/"}className="flex">
          <div className="flex items-center">
            <Image
              src={"/logo.svg"}
              alt="CarStalker Logo"
              width={200}
              height={60}
              className="h-20 w-auto object-contain"
            />
            {isAdminPage && (
              <span className="text-xs font-extralight ml-1">admin</span>
            )}
          </div>
        </Link>

        {/* Right Side - Saved Cars Button */}
        <div className="flex items-center space-x-4">
          {isAdminPage ?( 
            <Link href="/">
            <Button variant='outline' className="flex items-center gap-2">
              <ArrowLeft size={18} />
              <span>Back to App</span>
            </Button>
          </Link>
           ):(
          <SignedIn>
          <Link href="/saved-cars">
              <Button >
                <CarFront size={18} />
                <span className="hidden md:inline">Saved cars</span>
              </Button>
            </Link>
            
            {!isAdmin ? (
              <Link href="/reservations">
              <Button variant="outline">
                <Heart size={18} />
                <span className="hidden md:inline">My reservations</span>
              </Button>
            </Link>
            ):(
            <Link href="/admin">
              <Button variant="outline">
                <Layout size={18} />
                <span className="hidden md:inline">Admin Portal</span>
              </Button>
            </Link>
            )}
          </SignedIn>
          )}

          <SignedOut>
            <SignInButton forceRedirectUrl="/">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
