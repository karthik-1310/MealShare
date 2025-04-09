export type UserRole = 'provider' | 'ngo' | 'individual';

export type ListingStatus = 'active' | 'pending' | 'completed' | 'expired';

export type BidStatus = 'pending' | 'accepted' | 'rejected';

export type OrderStatus = 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';

export interface UserProfile {
  id: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface FoodListing {
  id: string;
  provider_id: string;
  title: string;
  description?: string;
  food_type?: string;
  quantity: number;
  quantity_unit: string;
  best_by: string;
  is_pickup_urgent: boolean;
  min_bid: number;
  status: ListingStatus;
  location: unknown; // PostGIS geography type
  address: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  listing_id: string;
  bidder_id: string;
  amount: number;
  status: BidStatus;
  pickup_time?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  bid_id: string;
  listing_id: string;
  provider_id: string;
  recipient_id: string;
  status: OrderStatus;
  payment_id?: string;
  pickup_code?: string;
  pickup_confirmed_at?: string;
  delivery_confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      food_listings: {
        Row: FoodListing;
        Insert: Omit<FoodListing, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FoodListing, 'id' | 'provider_id' | 'created_at' | 'updated_at'>>;
      };
      bids: {
        Row: Bid;
        Insert: Omit<Bid, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Bid, 'id' | 'listing_id' | 'bidder_id' | 'created_at' | 'updated_at'>>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Order, 'id' | 'bid_id' | 'listing_id' | 'provider_id' | 'recipient_id' | 'created_at' | 'updated_at'>>;
      };
      notifications: {
        Row: Notification;
        Insert: Omit<Notification, 'id' | 'created_at'>;
        Update: Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
} 