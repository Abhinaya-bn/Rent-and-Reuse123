import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ItemCard } from '@/components/ItemCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { CATEGORY_NAMES } from '@/lib/constants';
import { MOCK_ITEMS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Item, NavState } from '@/types';

export function BrowsePage({ state }: { state: NavState }) {
  const initialQuery = state.params?.q ?? '';
  const initialCategory = state.params?.category ?? '';

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high'>('recent');

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        let filtered = [...MOCK_ITEMS];
        if (searchQuery) {
          filtered = filtered.filter((i) =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.description.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        if (selectedCategory) {
          filtered = filtered.filter((i) => i.category === selectedCategory);
        }
        setItems(filtered);
        return;
      }

      let query = supabase.from('items').select('*');
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      if (sortBy === 'price-low') {
        query = query.order('daily_price', { ascending: true });
      } else if (sortBy === 'price-high') {
        query = query.order('daily_price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      let filtered = data ?? [];
      if (searchQuery) {
        filtered = filtered.filter(
          (i) =>
            i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      setItems(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-2">Browse Items</h1>
        <p className="text-chocolate-500">Find exactly what you need from fellow students.</p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-chocolate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 placeholder:text-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
        >
          <option value="">All Categories</option>
          {CATEGORY_NAMES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
        >
          <option value="recent">Most Recent</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>

      {/* Active filter chips */}
      {(selectedCategory || searchQuery) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-chocolate-700 text-sm font-medium">
              {selectedCategory}
              <button onClick={() => setSelectedCategory('')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sand-200 text-chocolate-700 text-sm font-medium">
              "{searchQuery}"
              <button onClick={() => setSearchQuery('')}>
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <LoadingState message="Loading items..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchItems} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-12 w-12" />}
          title="No items found"
          description="Try adjusting your search or filters to find what you're looking for."
        />
      ) : (
        <>
          <p className="text-sm text-chocolate-500 mb-4">
            {items.length} item{items.length !== 1 ? 's' : ''} available
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {items.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
