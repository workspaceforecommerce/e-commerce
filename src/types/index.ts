export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  status: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  variant_name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  attributes?: Record<string, string>;
}

export interface Review {
  id: number;
  product_id?: number;
  customer_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: number;
  status: string;
  created_at?: string;
}

export interface Product {
  id: number;
  category_id: number;
  category_name?: string;
  title: string;
  slug: string;
  sku: string;
  short_description: string;
  full_description: string;
  base_price: number;
  discount_price?: number | null;
  stock_quantity: number;
  images: string[];
  is_featured: number;
  is_bestseller: number;
  is_trending: number;
  status: string;
  meta_title?: string;
  meta_description?: string;
  variants?: ProductVariant[];
  reviews?: Review[];
}

export interface CartItem {
  product_id: number;
  variant_id?: number | null;
  title: string;
  variant_name?: string;
  image: string;
  price: number;
  original_price: number;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: 'flat' | 'percentage';
  discountValue: number;
  calculatedDiscount: number;
}

export interface Order {
  id: number;
  order_number: string;
  invoice_number?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  pincode: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  total_amount: number;
  courier_name?: string;
  tracking_number?: string;
  tracking_url?: string;
  cod_confirmed?: number;
  created_at: string;
  items?: {
    product_title: string;
    variant_name?: string;
    price: number;
    quantity: number;
    total_price: number;
  }[];
}

export interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  section: string;
  status: string;
  sort_order: number;
}

export interface AbandonedCart {
  id: number;
  customer_email: string;
  customer_phone: string;
  cart_data: string;
  reminder_count: number;
  last_reminder_sent?: string;
  created_at: string;
}

export interface ApiLog {
  id: number;
  service_name: string;
  event_type: string;
  recipient: string;
  payload: string;
  response_status: string;
  created_at: string;
}
