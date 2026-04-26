// utils/paths.js
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const getAssetPath = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
};

export const getBasePath = () => basePath;