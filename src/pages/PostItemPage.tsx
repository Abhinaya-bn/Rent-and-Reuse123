import { useState } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ImageUploader, type UploadedImage } from '@/components/ImageUploader';
import { CATEGORY_NAMES } from '@/lib/constants';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { FALLBACK_IMAGE } from '@/lib/images';

export function PostItemPage() {
  const { navigate } = useNav();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="font-serif text-2xl font-bold text-chocolate-800 mb-3">Sign in required</h1>
        <p className="text-chocolate-500 mb-6">You need to be signed in to post an item.</p>
        <Button onClick={() => navigate('login')}>Go to Sign In</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const imageUrls = uploadedImages.map((img) => img.url);
      const coverImage = imageUrls[0] ?? FALLBACK_IMAGE;

      const { error: insertError } = await supabase.from('items').insert({
        title,
        description,
        category,
        daily_price: parseFloat(dailyPrice),
        image_url: coverImage,
        image_urls: imageUrls,
        is_available: true,
      });
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => navigate('dashboard'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post item');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-chocolate-800 mb-2">Item Posted!</h1>
        <p className="text-chocolate-500">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <button
        onClick={() => navigate('dashboard')}
        className="flex items-center gap-2 text-sm font-medium text-chocolate-600 hover:text-chocolate-800 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </button>

      <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-2">Post an Item</h1>
      <p className="text-chocolate-500 mb-8">List something you're willing to rent to fellow students.</p>

      {!isSupabaseConfigured && (
        <div className="mb-6 p-4 rounded-xl bg-sand-200 text-chocolate-700 text-sm">
          Note: The database is not connected. Submitted items won't be saved.
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-chocolate-700 mb-1.5">Item Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., TI-84 Graphing Calculator"
            className="w-full px-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 placeholder:text-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-chocolate-700 mb-1.5">Description</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the item's condition, what it includes, and any relevant details..."
            className="w-full px-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 placeholder:text-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-chocolate-700 mb-1.5">Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
            >
              <option value="">Select a category</option>
              {CATEGORY_NAMES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-chocolate-700 mb-1.5">Daily Price ($)</label>
            <input
              type="number"
              required
              min="0"
              step="0.5"
              value={dailyPrice}
              onChange={(e) => setDailyPrice(e.target.value)}
              placeholder="e.g., 2.50"
              className="w-full px-4 py-2.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 placeholder:text-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400"
            />
          </div>
        </div>

        <ImageUploader
          uploadedImages={uploadedImages}
          onImagesChange={setUploadedImages}
          onError={setError}
        />

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={submitting} size="lg" className="flex-1">
            {submitting ? 'Posting...' : 'Post Item'}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => navigate('dashboard')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
