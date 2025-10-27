/**
 * Utility function to get the correct asset path based on environment
 * This handles the difference between local development and GitHub Pages deployment
 */
export const getAssetPath = (path) => {
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // In production (GitHub Pages), prepend the repository name as basePath
    // In development, return the clean path as-is for Next.js dev server
    if (process.env.NODE_ENV === 'production') {
        return `/my-portfolio${cleanPath}`;
    }
    
    return cleanPath;
};

/**
 * Get base path for the application
 */
export const getBasePath = () => {
    return process.env.NODE_ENV === 'production' ? '/my-portfolio' : '';
};
