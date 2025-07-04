import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import PageLoader from "@/components/pageLoader";
import ChatBotWidget from "@/components/ChatBotWidget";
// import { Icon, icons } from "lucide-react";


const inter = Inter({subsets:["latin"]});

export const metadata = {
  title: "Car Stalker",
  description: "Find Your Dream Car With Us",
    // icons:{
    //   icon: "/favicon.ico",
    // },
};

export default function RootLayout({ children }) {
  return (
     <ClerkProvider>
      <html lang="en">
      <body className={`${inter.className}`}>

        <Header/>
        <PageLoader />
        <ChatBotWidget />
        <main className="min-h-screen">{children}</main>
        <Toaster richColors/>

        <footer className="bg-blue-50 py-12">
          <div className="container max-auto px-4 text-center text-gray-600">
            <p>© 2025 Car Stalker. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}

