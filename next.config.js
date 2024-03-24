const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['rv1nwtdnxtq0qfpb.public.blob.vercel-storage.com'],
  },
};

module.exports = withNextIntl(nextConfig);
