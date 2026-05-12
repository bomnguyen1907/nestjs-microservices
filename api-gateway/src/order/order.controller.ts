import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { OrderServiceGrpc } from '../interfaces';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateOrderDto {
  product_id!: string;
  quantity!: number;
}

@Controller('orders')
@UseGuards(JwtAuthGuard) // toàn bộ controller này cần JWT
export class OrderController implements OnModuleInit {
  private orderService!: OrderServiceGrpc;

  constructor(@Inject('ORDER_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.orderService =
      this.client.getService<OrderServiceGrpc>('OrderService');
  }

  // POST /orders — tạo order mới, lấy user_id từ JWT
  @Post()
  async createOrder(
    @Request() req: { user: { userId: string } },
    @Body() body: CreateOrderDto,
  ) {
    return firstValueFrom(
      this.orderService.CreateOrder({
        user_id: req.user.userId,
        product_id: body.product_id,
        quantity: body.quantity,
      }),
    );
  }

  // GET /orders — list orders của user hiện tại (streaming, gom thành array)
  @Get()
  async listMyOrders(@Request() req: { user: { userId: string } }) {
    const orders: any[] = [];
    return new Promise((resolve, reject) => {
      this.orderService
        .ListOrdersByUser({ user_id: req.user.userId })
        .subscribe({
          next: (o) => orders.push(o),
          error: (err: unknown) =>
            reject(err instanceof Error ? err : new Error(String(err))),
          complete: () => resolve(orders),
        });
    });
  }
}
