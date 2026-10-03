import { useState } from 'react';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { useNav } from '@/context/NavContext';
import { ItemCard } from '@/components/ItemCard';
import { CATEGORIES } from '@/lib/constants';
import { MOCK_ITEMS } from '@/lib/mockData';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Item } from '@/types';

export function HomePage() {
  const { navigate } = useNav();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('browse', searchQuery ? { q: searchQuery } : undefined);
  };

  const featuredItems: Item[] = isSupabaseConfigured ? [] : MOCK_ITEMS.slice(0, 6);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sand-200 via-sand-100 to-cream py-16 sm:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl">
            <div
              className="animate-slide-up inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-chocolate-100 text-chocolate-700 text-sm font-medium mb-6"
              style={{ animationDelay: '0.1s' }}
            >
              <Sparkles className="h-4 w-4" />
              Rent, don't buy — save money on student essentials
            </div>
            <h1
              className="animate-slide-up font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-chocolate-800 leading-tight mb-4 text-balance"
              style={{ animationDelay: '0.2s' }}
            >
              Borrow what you need.
              <br />
              <span className="text-chocolate-500">Lend what you don't.</span>
            </h1>
            <p
              className="animate-slide-up text-lg text-chocolate-600 mb-8 max-w-2xl leading-relaxed"
              style={{ animationDelay: '0.3s' }}
            >
              A student marketplace for renting calculators, textbooks, laptops, lab
              equipment, and more. Why buy when you can borrow?
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="animate-slide-up flex gap-2 max-w-2xl"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-chocolate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for calculators, books, laptops..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-sand-300 bg-white text-chocolate-800 placeholder:text-chocolate-400 focus:outline-none focus:ring-2 focus:ring-chocolate-400 transition-all duration-200"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl bg-chocolate-800 text-cream font-medium hover:bg-chocolate-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex items-center gap-2"
              >
                Search
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-chocolate-800">Browse by Category</h2>
          <button
            onClick={() => navigate('categories')}
            className="text-sm font-medium text-chocolate-600 hover:text-chocolate-800 flex items-center gap-1 transition-colors duration-200 group"
          >
            View all <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => navigate('browse', { category: cat.name })}
              className="animate-stagger flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-sand-200 hover:border-sand-300 hover:shadow-md hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={`p-3 rounded-xl ${cat.color} transition-transform duration-200 group-hover:scale-110`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-chocolate-700 text-center">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-bold text-chocolate-800">Featured Items</h2>
          <button
            onClick={() => navigate('browse')}
            className="text-sm font-medium text-chocolate-600 hover:text-chocolate-800 flex items-center gap-1 transition-colors duration-200 group"
          >
            See all <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {featuredItems.map((item, i) => (
            <ItemCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sand-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="font-serif text-2xl font-bold text-chocolate-800 text-center mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Find an item', desc: 'Search and browse items posted by fellow students near you.' },
              { step: '02', title: 'Send a request', desc: 'Pick your dates and send a rental request to the owner.' },
              { step: '03', title: 'Get approved', desc: 'The owner reviews your request and approves it. Pick up and go!' },
            ].map((s, i) => (
              <div
                key={s.step}
                className="animate-stagger text-center"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-chocolate-800 text-cream font-serif text-lg font-bold mb-4 transition-transform duration-300 hover:scale-110">
                  {s.step}
                </div>
                <h3 className="font-semibold text-chocolate-800 mb-2">{s.title}</h3>
                <p className="text-sm text-chocolate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
