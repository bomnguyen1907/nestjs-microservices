import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

export interface ProductServiceGrpc {
  GetProduct(data: { id: string }): Observable<Product>;
  ListProducts(data: Record<string, never>): Observable<Product>;
  CheckStock(data: {
    product_id: string;
    quantity: number;
  }): Observable<{ available: boolean; message: string }>;
}

export interface OrderServiceGrpc {
  CreateOrder(data: {
    user_id: string;
    product_id: string;
    quantity: number;
  }): Observable<Order>;
  ListOrdersByUser(data: { user_id: string }): Observable<Order>;
}
