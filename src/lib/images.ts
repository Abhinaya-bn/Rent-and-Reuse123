import type { Item } from '@/types';

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg';

export function getItemImages(item: Pick<Item, 'image_url' | 'image_urls'>): string[] {
  const urls = item.image_urls;
  if (Array.isArray(urls) && urls.length > 0) {
    return urls;
  }
  if (item.image_url) {
    return [item.image_url];
  }
  return [FALLBACK_IMAGE];
}

export function getFirstImage(item: Pick<Item, 'image_url' | 'image_urls'>): string {
  return getItemImages(item)[0] ?? FALLBACK_IMAGE;
}

export { FALLBACK_IMAGE };
