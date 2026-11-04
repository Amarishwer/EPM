import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Edam Property Management',
    short_name: 'Edam PM',
    description: 'Find properties and access your Edam tenant portal.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f7f7f3',
    theme_color: '#123b36',
    icons: [
      {
        src: '/icons/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  }
}
