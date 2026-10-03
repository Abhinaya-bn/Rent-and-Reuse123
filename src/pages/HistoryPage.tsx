import { useEffect, useState } from 'react';
import { History, Clock } from 'lucide-react';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/States';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useNav } from '@/context/NavContext';
import { MOCK_REQUESTS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { RentalRequest } from '@/types';

export function HistoryPage() {
  const { user } = useAuth();
  const { navigate } = useNav();
  const [history, setHistory] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setHistory(isSupabaseConfigured ? [] : MOCK_REQUESTS.filter((r) => r.status === 'returned' || r.status === 'rejected'));
        setLoading(false);
        return;
      }
      try {
        if (!isSupabaseConfigured) {
          setHistory(MOCK_REQUESTS.filter((r) => r.status === 'returned' || r.status === 'rejected'));
          setLoading(false);
          return;
        }

        // Fetch user's owned item IDs first
        const { data: ownedItems, error: itemsError } = await supabase
          .from('items')
          .select('id')
          .eq('owner_id', user.id);
        if (itemsError) throw itemsError;

        const ownedItemIds = ownedItems?.map((i) => i.id) ?? [];

        // Fetch requests as renter (returned/rejected only)
        const { data: asRenter, error: renterError } = await supabase
          .from('rental_requests')
          .select('*, item:items(*)')
          .eq('renter_id', user.id)
          .in('status', ['returned', 'rejected'])
          .order('created_at', { ascending: false });
        if (renterError) throw renterError;

        // Fetch requests on user's items (returned/rejected only)
        let asOwner: RentalRequest[] = [];
        if (ownedItemIds.length > 0) {
          const { data: ownerReqs, error: ownerError } = await supabase
            .from('rental_requests')
            .select('*, item:items(*)')
            .in('item_id', ownedItemIds)
            .in('status', ['returned', 'rejected'])
            .order('created_at', { ascending: false });
          if (ownerError) throw ownerError;
          asOwner = ownerReqs ?? [];
        }

        // Merge, deduplicate by id, and sort by created_at desc
        const merged = [...(asRenter ?? []), ...asOwner];
        const seen = new Set<string>();
        const deduped = merged
          .filter((r) => {
            if (seen.has(r.id)) return false;
            seen.add(r.id);
            return true;
          })
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setHistory(deduped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  if (loading) return <LoadingState message="Loading history..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-2">History</h1>
      <p className="text-chocolate-500 mb-6">Completed and past rental transactions.</p>

      {history.length === 0 ? (
        <EmptyState
          icon={<History className="h-12 w-12" />}
          title="No history yet"
          description="Completed and rejected rental requests will appear here."
          action={
            <button
              onClick={() => navigate('browse')}
              className="px-5 py-2.5 rounded-lg bg-chocolate-800 text-cream text-sm font-medium hover:bg-chocolate-700 transition-colors"
            >
              Browse Items
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {history.map((req) => (
            <div
              key={req.id}
              className="rounded-xl bg-white border border-sand-200 p-4 hover:border-sand-300 transition-colors cursor-pointer"
              onClick={() => req.item && navigate('item-details', { id: req.item.id })}
            >
              <div className="flex items-center gap-3">
                <img
                  src={req.item?.image_url}
                  alt={req.item?.title}
                  className="w-14 h-14 rounded-lg object-cover bg-sand-100 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1907785/pexels-photo-1907785.jpeg'; }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-chocolate-800 text-sm truncate">{req.item?.title ?? 'Unknown item'}</h3>
                  <div className="flex items-center gap-1 text-xs text-chocolate-400 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(req.created_at).toLocaleDateString()} — {new Date(req.end_date).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[req.status]}`}>
                  {STATUS_LABELS[req.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
