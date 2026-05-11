import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc, GrpcMethod } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { type Model } from 'mongoose';
import { Observable, Subject, firstValueFrom } from 'rxjs';
import { Order } from './order.schema';
import { ProductServiceGrpc } from './product.interface';

@Controller()
export class OrderController implements OnModuleInit {
  private productService!: ProductServiceGrpc;

  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject('PRODUCT_PACKAGE') private client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.productService =
      this.client.getService<ProductServiceGrpc>('ProductService');
  }

  // Unary RPC: tạo order mới — gọi Product Service để check stock + lấy giá
  @GrpcMethod('OrderService', 'CreateOrder')
  async createOrder(data: {
    user_id: string;
    product_id: string;
    quantity: number;
  }) {
    // 1. Check stock qua gRPC tới product-service
    const stockCheck = await firstValueFrom(
      this.productService.CheckStock({
        product_id: data.product_id,
        quantity: data.quantity,
      }),
    );

    if (!stockCheck.available) {
      throw new Error(`Cannot create order: ${stockCheck.message}`);
    }

    // 2. Lấy giá sản phẩm qua gRPC
    const product = await firstValueFrom(
      this.productService.GetProduct({ id: data.product_id }),
    );

    // 3. Tính tổng tiền và lưu order
    const total_price = product.price * data.quantity;
    const newOrder = await this.orderModel.create({
      user_id: data.user_id,
      product_id: data.product_id,
      quantity: data.quantity,
      total_price,
      status: 'confirmed',
    });

    return {
      id: newOrder._id.toString(),
      user_id: newOrder.user_id,
      product_id: newOrder.product_id,
      quantity: newOrder.quantity,
      total_price: newOrder.total_price,
      status: newOrder.status,
      created_at:
        (newOrder as { createdAt?: Date }).createdAt?.toISOString() ?? '',
    };
  }

  // Server Streaming RPC: list orders của user
  @GrpcMethod('OrderService', 'ListOrdersByUser')
  listOrdersByUser(data: { user_id: string }): Observable<any> {
    const subject = new Subject<any>();

    this.orderModel
      .find({ user_id: data.user_id })
      .then((orders) => {
        orders.forEach((order, i) => {
          setTimeout(() => {
            subject.next({
              id: order._id.toString(),
              user_id: order.user_id,
              product_id: order.product_id,
              quantity: order.quantity,
              total_price: order.total_price,
              status: order.status,
              created_at:
                (order as { createdAt?: Date }).createdAt?.toISOString() ?? '',
            });
          }, i * 500);
        });
        setTimeout(() => subject.complete(), orders.length * 500 + 100);
      })
      .catch((err) => subject.error(err));

    return subject.asObservable();
  }
}
