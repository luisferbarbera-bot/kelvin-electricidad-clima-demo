/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // The page is fully static: `next build` writes a plain static site to `out/`,
  // deployable on Vercel, Netlify or any static host.
  output: "export",
  images: { unoptimized: true },
};
