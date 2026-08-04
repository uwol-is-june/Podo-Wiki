import type { NextConfig } from "next";

// 단체 썸네일(TASK-075)은 Supabase Storage 의 public 버킷에서 온다.
// 빌드 시 env 가 있으면 우리 프로젝트 호스트만 허용하고, 없으면 supabase 호스트 전체로 폴백.
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "**.supabase.co";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    // 썸네일 업로드가 서버 액션 FormData 로 올라감. 기본 1MB 로는 2MB 이미지가 막힌다.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
