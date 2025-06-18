// //Dynamic
// "use client";
// import { useEffect, useState } from "react";


// const PageLoader = () => {
//   const [isLoading, setIsLoading] = useState(true); //false

//   useEffect(() => {
//     const handleLoad = () => {
//         setIsLoading(false);
//     };

//     if (document.readyState === "complete") {
//       handleLoad(); // If already loaded
//     } else {
//       window.addEventListener("load", handleLoad); // Wait for full load
//     }

//     return () => window.removeEventListener("load", handleLoad);
//   }, []); 

//   if (!isLoading) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70">
      
//       <img src="loader.gif" alt="loading..." className="w-30 h-30" />
//     </div>
//   );
// };

// export default PageLoader;


"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const PageLoader = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 1000); // Adjust time as needed
    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/70">
      <img
        src="/loader.gif" // 👈 make sure this path is correct
        alt="Loading..."
        className="w-30 h-30" // adjust size as needed
      />
    </div>
  );
};

export default PageLoader;
