import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { ItemCard } from '@/components/ItemCard';
import { EmptyState } from '@/components/ui/States';
import { useSavedItems } from '@/context/SavedItemsContext';
import { useNav } from '@/context/NavContext';
import { MOCK_ITEMS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useEffect } from 'react';
import type { Item } from '@/types';

export function SavedItemsPage() {
  const { savedIds } = useSavedItems();
  const { navigate } = useNav();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      if (savedIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      if (!isSupabaseConfigured) {
        setItems(MOCK_ITEMS.filter((i) => savedIds.includes(i.id)));
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('items').select('*').in('id', savedIds);
      setItems(data ?? []);
      setLoading(false);
    };
    fetchSaved();
  }, [savedIds]);

  if (!loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-2">Saved Items</h1>
        <div className="mt-8">
          <EmptyState
            icon={<Bookmark className="h-12 w-12" />}
            title="No saved items yet"
            description="Tap the heart icon on any item to save it for later."
            action={
              <button
                onClick={() => navigate('browse')}
                className="px-5 py-2.5 rounded-lg bg-chocolate-800 text-cream text-sm font-medium hover:bg-chocolate-700 transition-colors"
              >
                Browse Items
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-2">Saved Items</h1>
      <p className="text-chocolate-500 mb-6">Items you've bookmarked to rent later.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item, i) => (
          <ItemCard key={item.id} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
