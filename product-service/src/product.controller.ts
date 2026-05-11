import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable, Subject } from 'rxjs';
import { Product } from './product.entity';

@Controller()
export class ProductController {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  // Unary RPC
  @GrpcMethod('ProductService', 'GetProduct')
  async getProduct(data: { id: string }) {
    const product = await this.productRepo.findOne({ where: { id: data.id } });
    if (!product) {
      return { id: '', name: 'Not found', price: 0, stock: 0 };
    }
    return product;
  }

  // Server Streaming RPC
  @GrpcMethod('ProductService', 'ListProducts')
  listProducts(): Observable<Product> {
    const subject = new Subject<Product>();

    this.productRepo.find().then((products) => {
      products.forEach((p, i) => {
        // gửi từng sản phẩm cách nhau 500ms để thấy rõ streaming
        setTimeout(() => subject.next(p), i * 500);
      });
      setTimeout(() => subject.complete(), products.length * 500);
    });

    return subject.asObservable();
  }

  // Unary phụ: check stock
  @GrpcMethod('ProductService', 'CheckStock')
  async checkStock(data: { product_id: string; quantity: number }) {
    const product = await this.productRepo.findOne({
      where: { id: data.product_id },
    });
    if (!product) {
      return { available: false, message: 'Product not found' };
    }
    if (product.stock < data.quantity) {
      return { available: false, message: 'Not enough stock' };
    }
    return { available: true, message: 'OK' };
  }
}
