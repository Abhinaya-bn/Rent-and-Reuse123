import { createContext, useContext } from 'react';
import type { NavState, Page } from '@/types';

interface NavContextValue {
  state: NavState;
  navigate: (page: Page, params?: Record<string, string>) => void;
}

export const NavContext = createContext<NavContextValue>({
  state: { page: 'home' },
  navigate: () => {},
});

export const useNav = () => useContext(NavContext);
