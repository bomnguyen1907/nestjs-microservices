import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ProductController } from './product/product.controller';
import { OrderController } from './order/order.controller';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'PRODUCT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'product',
          protoPath: join(__dirname, 'proto/product.proto'),
          url: process.env.PRODUCT_SERVICE_URL || 'localhost:50051',
          loader: { keepCase: true },
        },
      },
      {
        name: 'ORDER_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'order',
          protoPath: join(__dirname, 'proto/order.proto'),
          url: process.env.ORDER_SERVICE_URL || 'localhost:50052',
          loader: { keepCase: true },
        },
      },
    ]),
  ],
  controllers: [ProductController, OrderController],
})
export class AppModule {}
