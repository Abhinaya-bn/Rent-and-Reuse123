import { useEffect, useState } from 'react';
import { LayoutGrid } from 'lucide-react';

export function IntroAnimation() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2300);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="intro-overlay fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream">
      <div className="animate-intro-logo flex items-center justify-center w-16 h-16 rounded-2xl bg-chocolate-800 text-cream shadow-lg">
        <LayoutGrid className="h-8 w-8" />
      </div>
      <div className="animate-intro-text mt-6 font-serif text-2xl font-bold text-chocolate-800 tracking-wider">
        Rent &amp; Reuse
      </div>
      <div className="animate-fade-in mt-2 text-sm text-chocolate-400" style={{ animationDelay: '0.5s' }}>
        Borrow smarter, save more
      </div>
    </div>
  );
}
