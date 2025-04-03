// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     experimental:{
//         esmExternals:true,
//     },
// };


// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: 
    {
      serverComponentsHmrCache: false,
    },

    images:{
      remotePatterns: [
        {
          protocol: "https",
          hostname: "jogkmdzyocutmgbiyvlw.supabase.co",
        },
      ],

    },


    async headers(){
      return[
        {
          source:"/embed",
          headers:[
            {
              key:"Content-Security-Policy",
              value:"frame-src 'self' https://carstalker-waitlist.created.app/"
            }
          ]
        }
      ]
    },

    experimental: {
      middlewarePerRoute: true, // ✅ Enable per-route middleware
      esmExternals: true, // Optional if you're using ESM modules
    },
    reactStrictMode: true, // Recommended for better debugging
  };
  
  export default nextConfig;
  
