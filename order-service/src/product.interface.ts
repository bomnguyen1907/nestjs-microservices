import { Observable } from 'rxjs';

export interface ProductServiceGrpc {
  GetProduct(data: { id: string }): Observable<{
    id: string;
    name: string;
    price: number;
    stock: number;
  }>;

  CheckStock(data: { product_id: string; quantity: number }): Observable<{
    available: boolean;
    message: string;
  }>;
}
