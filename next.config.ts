import type { NextConfig } from "next";

// Derive the Supabase hostname from SUPABASE_URL so the Storage public URLs
// for kudos image attachments load through next/image. Falls back to the
// hosted-supabase wildcard; local Supabase uses 127.0.0.1:54321.
function supabaseHostname(): string {
  const url = process.env.SUPABASE_URL;
  if (!url) return "*.supabase.co";
  try {
    return new URL(url).hostname;
  } catch {
    return "*.supabase.co";
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Google account avatars (Supabase Google OAuth populates
      // user_metadata.avatar_url with an lh3.googleusercontent.com URL).
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // Kudos image attachments served from the Supabase Storage public bucket.
      {
        protocol: "https",
        hostname: supabaseHostname(),
        pathname: "/storage/v1/object/public/**",
      },
      // Local Supabase (supabase start) — http on the loopback.
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "54321",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
