import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.227'],
  // Afterhours §5.171 ONEFORM — the creator onboarding post's link. §8.49's
  // rule (SP-side creative points at sonicpulsefestival.com) holds; the
  // destination is the creator landing, not the ticket hand-off.
  async redirects() {
    return [{ source: "/creators", destination: "https://www.onlyafterhours.com/creators", permanent: false }];
  },
};

export default nextConfig;
