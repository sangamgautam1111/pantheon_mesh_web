/** @type {import('next').NextConfig} */
const nextConfig = {
    /* 
     * Optimization: Disable X-Powered-By header for security and footprint reduction.
     * We operate as a sovereign protocol; no need for server signatures.
     */
    poweredByHeader: false,

    // Strict mode enabled for high-integrity rendering
    reactStrictMode: true,

    // Target: Export for high-performance static hosting on Firebase CDN
    output: 'export',
    // Required: Disable trailing slashes for Firebase Hosting compatibility
    trailingSlash: true,
};

export default nextConfig;
