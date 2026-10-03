import { useEffect, useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { EmptyState, LoadingState } from '@/components/ui/States';
import { useNav } from '@/context/NavContext';
import { MOCK_ITEMS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Item } from '@/types';

interface SellerInfo {
  ownerId: string;
  itemCount: number;
  items: Item[];
}

export function VisitedSellersPage() {
  const { navigate } = useNav();
  const [sellers, setSellers] = useState<SellerInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        if (!isSupabaseConfigured) {
          const grouped: Record<string, Item[]> = {};
          MOCK_ITEMS.forEach((item) => {
            if (!grouped[item.owner_id]) grouped[item.owner_id] = [];
            grouped[item.owner_id].push(item);
          });
          setSellers(
            Object.entries(grouped).map(([ownerId, items]) => ({
              ownerId,
              itemCount: items.length,
              items,
            }))
          );
          setLoading(false);
          return;
        }
        const { data } = await supabase.from('items').select('*').order('created_at', { ascending: false });
        const grouped: Record<string, Item[]> = {};
        (data ?? []).forEach((item: Item) => {
          if (!grouped[item.owner_id]) grouped[item.owner_id] = [];
          grouped[item.owner_id].push(item);
        });
        setSellers(
          Object.entries(grouped).map(([ownerId, items]) => ({
            ownerId,
            itemCount: items.length,
            items,
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  if (loading) return <LoadingState message="Loading sellers..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-2">Visited Sellers</h1>
      <p className="text-chocolate-500 mb-6">Students who have posted items on the marketplace.</p>

      {sellers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No sellers found"
          description="Sellers will appear here once items are posted."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {sellers.map((seller) => (
            <div key={seller.ownerId} className="rounded-xl bg-white border border-sand-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-chocolate-100 text-chocolate-700 font-semibold text-lg">
                  {seller.ownerId.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-chocolate-800 text-sm">Seller {seller.ownerId.slice(0, 8)}</h3>
                  <p className="text-xs text-chocolate-500">{seller.itemCount} item{seller.itemCount !== 1 ? 's' : ''} listed</p>
                </div>
              </div>
              <div className="space-y-2">
                {seller.items.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate('item-details', { id: item.id })}
                    className="flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-sand-100 transition-colors"
                  >
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-10 h-10 rounded-md object-cover bg-sand-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-chocolate-700 truncate">{item.title}</p>
                      <p className="text-xs text-chocolate-400">${item.daily_price}/day</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-chocolate-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
