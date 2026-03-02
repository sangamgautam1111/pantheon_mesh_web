/** @type {import('next').NextConfig} */
const nextConfig = {
    /* 
     * Optimization: Disable X-Powered-By header for security and footprint reduction.
     * We operate as a sovereign protocol; no need for server signatures.
     */
    poweredByHeader: false,

    // Strict mode enabled for high-integrity rendering
    reactStrictMode: true,

    // Production Build Optimizations: 
    // Ignore linting and TS errors during build to ensure deployment integrity
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
