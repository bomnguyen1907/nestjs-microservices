import { Controller, Get, Inject, OnModuleInit, Param } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { ProductServiceGrpc } from '../interfaces';
import { firstValueFrom } from 'rxjs';

@Controller('products')
export class ProductController implements OnModuleInit {
  private productService!: ProductServiceGrpc;

  constructor(@Inject('PRODUCT_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.productService =
      this.client.getService<ProductServiceGrpc>('ProductService');
  }

  // GET /products — gọi streaming RPC nhưng gom lại trả về JSON array
  @Get()
  async listProducts() {
    const products: any[] = [];
    return new Promise((resolve, reject) => {
      this.productService.ListProducts({}).subscribe({
        next: (p) => products.push(p),
        error: (err: unknown) =>
          reject(err instanceof Error ? err : new Error(String(err))),
        complete: () => resolve(products),
      });
    });
  }

  // GET /products/:id — Unary RPC
  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return firstValueFrom(this.productService.GetProduct({ id }));
  }
}
