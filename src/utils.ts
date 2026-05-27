const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function assetUrl(path: string): string {
  return `${base}${path}`;
}

export function pageUrl(path: string): string {
  return `${base}${path}`;
}
