import { useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SavedItemsProvider } from '@/context/SavedItemsContext';
import { NavContext } from '@/context/NavContext';
import { Navbar } from '@/components/Navbar';
import { IntroAnimation } from '@/components/IntroAnimation';
import { HomePage } from '@/pages/HomePage';
import { BrowsePage } from '@/pages/BrowsePage';
import { ItemDetailsPage } from '@/pages/ItemDetailsPage';
import { PostItemPage } from '@/pages/PostItemPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { SavedItemsPage } from '@/pages/SavedItemsPage';
import { ActivityPage } from '@/pages/ActivityPage';
import { VisitedSellersPage } from '@/pages/VisitedSellersPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import type { NavState, Page } from '@/types';

function AppContent() {
  const [state, setState] = useState<NavState>({ page: 'home' });

  const navigate = (page: Page, params?: Record<string, string>) => {
    setState({ page, params });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    switch (state.page) {
      case 'home':
        return <HomePage />;
      case 'browse':
        return <BrowsePage state={state} />;
      case 'item-details':
        return <ItemDetailsPage state={state} />;
      case 'post-item':
        return <PostItemPage />;
      case 'login':
        return <LoginPage />;
      case 'signup':
        return <SignupPage />;
      case 'dashboard':
        return <DashboardPage />;
      case 'saved':
        return <SavedItemsPage />;
      case 'activity':
        return <ActivityPage />;
      case 'visited-sellers':
        return <VisitedSellersPage />;
      case 'history':
        return <HistoryPage />;
      case 'categories':
        return <CategoriesPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <NavContext.Provider value={{ state, navigate }}>
      <div className="min-h-screen bg-cream">
        <Navbar state={state} />
        {/* key forces remount → triggers page-transition animation on navigation */}
        <main key={state.page + JSON.stringify(state.params ?? {})} className="page-transition">
          {renderPage()}
        </main>
        <footer className="border-t border-sand-200 bg-sand-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="font-serif text-lg font-semibold text-chocolate-800 mb-1">Rent & Reuse</p>
            <p className="text-sm text-chocolate-500">
              A student marketplace for borrowing instead of buying.
            </p>
          </div>
        </footer>
      </div>
    </NavContext.Provider>
  );
}

function App() {
  return (
    <AuthProvider>
      <SavedItemsProvider>
        <IntroAnimation />
        <AppContent />
      </SavedItemsProvider>
    </AuthProvider>
  );
}

export default App;
