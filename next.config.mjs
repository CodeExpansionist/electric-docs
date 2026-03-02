/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.currys.biz",
      },
      {
        protocol: "https",
        hostname: "www.currys.co.uk",
      },
      {
        protocol: "https",
        hostname: "currysprod.a.bigcontent.io",
      },
      {
        protocol: "https",
        hostname: "media.4rgos.it",
      },
      {
        protocol: "https",
        hostname: "brain-images-ssl.cdn.dixons.com",
      },
    ],
  },
};

export default nextConfig;
