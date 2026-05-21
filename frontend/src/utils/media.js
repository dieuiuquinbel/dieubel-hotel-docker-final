export function resolveMediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  if (path.startsWith('/uploads/')) {
    const configuredOrigin = import.meta.env.VITE_BACKEND_ORIGIN;
    if (configuredOrigin) {
      return `${configuredOrigin}${path}`;
    }

    if (typeof window !== 'undefined') {
      return `${window.location.protocol}//${window.location.hostname}:5000${path}`;
    }
  }

  return path;
}
