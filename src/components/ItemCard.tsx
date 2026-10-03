import { Heart } from 'lucide-react';
import type { Item } from '@/types';
import { useSavedItems } from '@/context/SavedItemsContext';
import { useNav } from '@/context/NavContext';
import { getFirstImage, FALLBACK_IMAGE } from '@/lib/images';

export function ItemCard({ item, index = 0 }: { item: Item; index?: number }) {
  const { toggleSave, isSaved } = useSavedItems();
  const { navigate } = useNav();
  const saved = isSaved(item.id);
  const delay = `${Math.min(index * 60, 480)}ms`;
  const coverImage = getFirstImage(item);
  const imageCount = item.image_urls && Array.isArray(item.image_urls) ? item.image_urls.length : 0;

  return (
    <div
      className="animate-stagger group cursor-pointer rounded-xl overflow-hidden bg-white border border-sand-200 hover:shadow-xl hover:border-sand-400 hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ animationDelay: delay }}
      onClick={() => navigate('item-details', { id: item.id })}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
        <img
          src={coverImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
        />
        {imageCount > 1 && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-chocolate-900/60 text-cream text-[10px] font-medium backdrop-blur-sm">
            {imageCount} photos
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleSave(item.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
          aria-label={saved ? 'Unsave item' : 'Save item'}
        >
          <Heart
            className={`h-4 w-4 transition-all duration-200 ${saved ? 'fill-chocolate-800 text-chocolate-800 scale-110' : 'text-chocolate-400'}`}
          />
        </button>
        {!item.is_available && (
          <div className="absolute inset-0 bg-chocolate-900/40 flex items-center justify-center animate-fade-in">
            <span className="px-3 py-1 rounded-full bg-white/95 text-chocolate-800 text-xs font-semibold">
              Currently Rented
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="inline-block px-2 py-0.5 rounded-md bg-sand-100 text-chocolate-600 text-xs font-medium mb-2 transition-colors group-hover:bg-sand-200">
          {item.category}
        </span>
        <h3 className="font-semibold text-chocolate-800 text-sm leading-snug line-clamp-2 mb-2 transition-colors group-hover:text-chocolate-600">
          {item.title}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-chocolate-800">${item.daily_price}</span>
            <span className="text-xs text-chocolate-500">/day</span>
          </div>
          <span className={`text-xs font-medium transition-colors ${item.is_available ? 'text-green-600' : 'text-chocolate-400'}`}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>
    </div>
  );
}
