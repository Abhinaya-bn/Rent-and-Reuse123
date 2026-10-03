import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Calendar, Tag, Check, X, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { useSavedItems } from '@/context/SavedItemsContext';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { MOCK_ITEMS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getItemImages, FALLBACK_IMAGE } from '@/lib/images';
import type { Item, NavState } from '@/types';

export function ItemDetailsPage({ state }: { state: NavState }) {
  const itemId = state.params?.id ?? '';
  const { navigate } = useNav();
  const { user } = useAuth();
  const { toggleSave, isSaved } = useSavedItems();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestResult, setRequestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchItem = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        const found = MOCK_ITEMS.find((i) => i.id === itemId);
        if (found) setItem(found);
        else setError('Item not found');
        return;
      }
      const { data, error: fetchError } = await supabase
        .from('items')
        .select('*')
        .eq('id', itemId)
        .maybeSingle();
      if (fetchError) throw fetchError;
      if (data) setItem(data);
      else setError('Item not found');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedImageIndex(0);
    fetchItem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item) return;
    setSubmitting(true);
    setRequestResult(null);
    try {
      const { error: insertError } = await supabase.from('rental_requests').insert({
        item_id: item.id,
        start_date: startDate,
        end_date: endDate,
        message: message || null,
      });
      if (insertError) throw insertError;
      setRequestResult({ success: true, message: 'Rental request sent successfully! The owner will review it shortly.' });
      setShowRequestForm(false);
      setStartDate('');
      setEndDate('');
      setMessage('');
    } catch (err) {
      setRequestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to send request',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading item details..." />;
  if (error) return <ErrorState message={error} onRetry={fetchItem} />;
  if (!item) return <ErrorState message="Item not found" />;

  const isOwner = user?.id === item.owner_id;
  const saved = isSaved(item.id);
  const allImages = getItemImages(item);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button
        onClick={() => navigate('browse')}
        className="flex items-center gap-2 text-sm font-medium text-chocolate-600 hover:text-chocolate-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to browse
      </button>

      {requestResult && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            requestResult.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {requestResult.success ? (
            <Check className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <X className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{requestResult.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative rounded-2xl overflow-hidden bg-sand-100 aspect-square">
            <img
              src={allImages[selectedImageIndex] ?? FALLBACK_IMAGE}
              alt={item.title}
              className="w-full h-full object-cover animate-fade-in"
              key={selectedImageIndex}
              onError={(e) => {
                (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
              }}
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5 text-chocolate-700" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-200 shadow-sm"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5 text-chocolate-700" />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-chocolate-900/60 text-cream text-xs font-medium backdrop-blur-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </span>
              </>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {allImages.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    i === selectedImageIndex
                      ? 'border-chocolate-800 scale-105'
                      : 'border-sand-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sand-100 text-chocolate-600 text-xs font-medium mb-3">
                <Tag className="h-3 w-3" />
                {item.category}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-chocolate-800 leading-tight">
                {item.title}
              </h1>
            </div>
            <button
              onClick={() => toggleSave(item.id)}
              className="p-2.5 rounded-full bg-sand-100 hover:bg-sand-200 transition-colors shrink-0"
              aria-label={saved ? 'Unsave' : 'Save'}
            >
              <Heart className={`h-5 w-5 ${saved ? 'fill-chocolate-800 text-chocolate-800' : 'text-chocolate-400'}`} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1.5 rounded-lg bg-chocolate-50 border border-chocolate-100">
              <span className="text-2xl font-bold text-chocolate-800">${item.daily_price}</span>
              <span className="text-sm text-chocolate-500"> / day</span>
            </div>
            <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              item.is_available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {item.is_available ? 'Available' : 'Currently Rented'}
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-chocolate-700 mb-2">Description</h2>
            <p className="text-chocolate-600 leading-relaxed text-sm">{item.description}</p>
          </div>

          <div className="mb-6 text-xs text-chocolate-400">
            Posted {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-3">
            {isOwner ? (
              <div className="p-4 rounded-xl bg-sand-100 text-chocolate-700 text-sm font-medium text-center">
                This is your listing. You can manage it from your dashboard.
              </div>
            ) : !user ? (
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('login')}
                  className="w-full"
                  size="lg"
                >
                  Sign in to request this item
                </Button>
              </div>
            ) : !isSupabaseConfigured ? (
              <div className="p-4 rounded-xl bg-sand-100 text-chocolate-600 text-sm text-center">
                  Rental requests require a connected database.
              </div>
            ) : !item.is_available ? (
              <div className="p-4 rounded-xl bg-sand-100 text-chocolate-600 text-sm text-center">
                This item is currently rented. Check back later.
              </div>
            ) : showRequestForm ? (
              <form onSubmit={handleRequest} className="space-y-3 p-4 rounded-xl border border-sand-200 bg-white">
                <h3 className="font-semibold text-chocolate-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Request to Rent
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-chocolate-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-lg border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-chocolate-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-chocolate-600 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 rounded-lg border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-chocolate-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-chocolate-600 mb-1">
                    Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                    placeholder="Tell the owner what you need it for..."
                    className="w-full px-3 py-2 rounded-lg border border-sand-300 text-sm focus:outline-none focus:ring-2 focus:ring-chocolate-400 resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Sending...' : 'Send Request'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                onClick={() => setShowRequestForm(true)}
                className="w-full"
                size="lg"
              >
                <MessageSquare className="h-4 w-4" />
                Request to Rent
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
