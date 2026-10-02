export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  category_id: number;
  category_name: string;
  brand_id: number;
  brand_name: string;
  short_description: string;
  full_description: string;
  ingredients: string;
  benefits: string;
  how_to_use: string;
  volume_weight: string;
  price: number;
  discount_price: number | null;
  stock: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  primary_image: string;
  gallery_images: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category_name: string;
  author_name: string;
  views: number;
  published_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  grand_total: number;
  payment_method: string;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  order_status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
  tracking_number?: string;
  items: { product_name: string; price: number; quantity: number; total: number }[];
  created_at: string;
}

export interface Coupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_spend: number;
  description: string;
}
