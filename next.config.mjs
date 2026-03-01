/** @type {import('next').NextConfig} */
const nextConfig = {
    /* 
     * Optimization: Disable X-Powered-By header for security and footprint reduction.
     * We operate as a sovereign protocol; no need for server signatures.
     */
    poweredByHeader: false,

    // Strict mode enabled for high-integrity rendering
    reactStrictMode: true,

    // Target: Standalone for K8s deployment efficiency
    output: 'standalone',
};

export default nextConfig;
