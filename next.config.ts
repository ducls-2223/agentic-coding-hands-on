import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Google account avatars (Supabase Google OAuth puts the user's
    // photo on lh3.googleusercontent.com in user_metadata.avatar_url).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
