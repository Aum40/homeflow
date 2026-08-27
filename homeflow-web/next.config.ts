import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // รูปจากมือถือ/กล้องมักมีขนาด 2-8 MB แต่ค่า default ของ Server Actions
      // คือ 1 MB ทำให้อัปโหลดรูปจริงล้มเหลว
      bodySizeLimit: '10mb'
    }
  },
  images: {
    remotePatterns: [new URL('https://res.cloudinary.com/pxe46r47/**')]
  }
};

export default nextConfig;
