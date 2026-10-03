import { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Package, Inbox, Send, Check, X, Clock, Trash2 } from 'lucide-react';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/States';
import { STATUS_LABELS, STATUS_COLORS } from '@/lib/constants';
import { MOCK_ITEMS, MOCK_REQUESTS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getFirstImage, FALLBACK_IMAGE } from '@/lib/images';
import type { Item, RentalRequest } from '@/types';

type Tab = 'listings' | 'incoming' | 'outgoing';

export function DashboardPage() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('listings');
  const [listings, setListings] = useState<Item[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<RentalRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        setListings(MOCK_ITEMS.filter((i) => i.owner_id === 'mock-user-1'));
        setIncomingRequests(MOCK_REQUESTS.filter((r) => r.item?.owner_id === 'mock-user-1'));
        setOutgoingRequests(MOCK_REQUESTS.filter((r) => r.renter_id === 'mock-user-1'));
        return;
      }

      const [listingsRes, incomingRes, outgoingRes] = await Promise.all([
        supabase.from('items').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase
          .from('rental_requests')
          .select('*, item:items(*)')
          .in('item_id', (await supabase.from('items').select('id').eq('owner_id', user.id)).data?.map((i) => i.id) ?? [])
          .order('created_at', { ascending: false }),
        supabase
          .from('rental_requests')
          .select('*, item:items(*)')
          .eq('renter_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (listingsRes.error) throw listingsRes.error;
      if (incomingRes.error) throw incomingRes.error;
      if (outgoingRes.error) throw outgoingRes.error;

      setListings(listingsRes.data ?? []);
      setIncomingRequests(incomingRes.data ?? []);
      setOutgoingRequests(outgoingRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected' | 'returned') => {
    try {
      const { error: updateError } = await supabase
        .from('rental_requests')
        .update({ status })
        .eq('id', requestId);
      if (updateError) throw updateError;
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request');
    }
  };

  const handleDeleteListing = async (itemId: string) => {
    try {
      const { error: deleteError } = await supabase.from('items').delete().eq('id', itemId);
      if (deleteError) throw deleteError;
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete listing');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="font-serif text-2xl font-bold text-chocolate-800 mb-3">Sign in required</h1>
        <p className="text-chocolate-500 mb-6">Sign in to view your dashboard.</p>
        <Button onClick={() => navigate('login')}>Go to Sign In</Button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Package; count: number }[] = [
    { id: 'listings', label: 'My Listings', icon: Package, count: listings.length },
    { id: 'incoming', label: 'Incoming Requests', icon: Inbox, count: incomingRequests.length },
    { id: 'outgoing', label: 'My Requests', icon: Send, count: outgoingRequests.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-1">Dashboard</h1>
          <p className="text-chocolate-500 text-sm">Manage your listings and rental requests.</p>
        </div>
        <Button onClick={() => navigate('post-item')}>
          <PlusCircle className="h-4 w-4" />
          Post New Item
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-sand-200 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'border-chocolate-800 text-chocolate-800'
                : 'border-transparent text-chocolate-500 hover:text-chocolate-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
            <span className="ml-1 px-2 py-0.5 rounded-full bg-sand-200 text-chocolate-600 text-xs">
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading your dashboard..." />
      ) : tab === 'listings' ? (
        listings.length === 0 ? (
          <EmptyState
            icon={<Package className="h-12 w-12" />}
            title="No listings yet"
            description="Post your first item to start earning from things you don't use."
            action={<Button onClick={() => navigate('post-item')}>Post an Item</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((item) => (
              <div key={item.id} className="rounded-xl overflow-hidden bg-white border border-sand-200">
                <div className="aspect-[4/3] overflow-hidden bg-sand-100">
                  <img
                    src={getFirstImage(item)}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-chocolate-500">{item.category}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {item.is_available ? 'Available' : 'Rented'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-chocolate-800 text-sm mb-2 line-clamp-1">{item.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-chocolate-800">${item.daily_price}/day</span>
                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete listing"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'incoming' ? (
        incomingRequests.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="No incoming requests"
            description="When someone requests to rent your items, they'll appear here."
          />
        ) : (
          <div className="space-y-4">
            {incomingRequests.map((req) => (
              <div key={req.id} className="rounded-xl bg-white border border-sand-200 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <img
                    src={req.item ? getFirstImage(req.item) : FALLBACK_IMAGE}
                    alt={req.item?.title}
                    className="w-full sm:w-20 h-20 rounded-lg object-cover bg-sand-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-chocolate-800 text-sm mb-1">{req.item?.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-chocolate-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(req.created_at).toLocaleDateString()}</span>
                      <span>From: {new Date(req.start_date).toLocaleDateString()}</span>
                      <span>To: {new Date(req.end_date).toLocaleDateString()}</span>
                    </div>
                    {req.message && (
                      <p className="text-sm text-chocolate-600 mt-2 italic">"{req.message}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                      {STATUS_LABELS[req.status]}
                    </span>
                    {req.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'approved')}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, 'rejected')}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {req.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'returned')}
                        className="px-3 py-1.5 rounded-lg bg-chocolate-100 text-chocolate-700 text-xs font-medium hover:bg-chocolate-200 transition-colors"
                      >
                        Mark Returned
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        outgoingRequests.length === 0 ? (
          <EmptyState
            icon={<Send className="h-12 w-12" />}
            title="No requests sent"
            description="Browse items and send rental requests to owners."
            action={<Button onClick={() => navigate('browse')}>Browse Items</Button>}
          />
        ) : (
          <div className="space-y-4">
            {outgoingRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl bg-white border border-sand-200 p-4 sm:p-5 cursor-pointer hover:border-sand-300 transition-colors"
                onClick={() => req.item && navigate('item-details', { id: req.item.id })}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <img
                    src={req.item ? getFirstImage(req.item) : FALLBACK_IMAGE}
                    alt={req.item?.title}
                    className="w-full sm:w-20 h-20 rounded-lg object-cover bg-sand-100"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-chocolate-800 text-sm mb-1">{req.item?.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-chocolate-500">
                      <span>From: {new Date(req.start_date).toLocaleDateString()}</span>
                      <span>To: {new Date(req.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status]}`}>
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
