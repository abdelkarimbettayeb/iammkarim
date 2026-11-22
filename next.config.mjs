/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        agentUpgrade: 'security',
        optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
    },
};

export default nextConfig;
