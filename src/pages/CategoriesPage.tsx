import { CATEGORIES } from '@/lib/constants';
import { useNav } from '@/context/NavContext';

export function CategoriesPage() {
  const { navigate } = useNav();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-chocolate-800 mb-2">Categories</h1>
        <p className="text-chocolate-500">Browse items by their category.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => navigate('browse', { category: cat.name })}
            className="animate-stagger group flex flex-col items-center gap-3 p-8 rounded-2xl bg-white border border-sand-200 hover:border-sand-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={`p-4 rounded-2xl ${cat.color} group-hover:scale-110 transition-transform duration-300`}>
              <cat.icon className="h-8 w-8" />
            </div>
            <span className="font-semibold text-chocolate-700">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
