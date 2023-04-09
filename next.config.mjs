// @ts-check

import NextBundleAnalyzer from '@next/bundle-analyzer';

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import('./src/env.mjs'));

const withBundleAnalyzer = NextBundleAnalyzer({
    enabled: process.env.ANALYZE === '1',
});

/** @type {import("next").NextConfig} */
const config = withBundleAnalyzer({
    reactStrictMode: true,

    /**
     * If you have the "experimental: { appDir: true }" setting enabled, then you
     * must comment the below `i18n` config out.
     *
     * @see https://github.com/vercel/next.js/issues/41980
     */
    i18n: {
        locales: ['en'],
        defaultLocale: 'en',
    },
    images: {
        minimumCacheTTL: 60,
    },
});
export default config;
