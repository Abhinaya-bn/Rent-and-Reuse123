export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  daily_price: number;
  image_url: string;
  image_urls?: string[] | null;
  is_available: boolean;
  owner_id: string;
  created_at: string;
}

export interface RentalRequest {
  id: string;
  item_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'returned';
  message: string | null;
  created_at: string;
  item?: Item;
}

export type Page =
  | 'home'
  | 'browse'
  | 'item-details'
  | 'post-item'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'saved'
  | 'activity'
  | 'visited-sellers'
  | 'history'
  | 'categories';

export interface NavState {
  page: Page;
  params?: Record<string, string>;
}
