import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Order, OrderSchema } from './order.schema';
import { OrderController } from './order.controller';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/orders',
    ),
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ClientsModule.register([
      {
        name: 'PRODUCT_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'product',
          protoPath: join(__dirname, 'proto/product.proto'),
          url: process.env.PRODUCT_SERVICE_URL || 'localhost:50051',
          loader: {
            keepCase: true,
          },
        },
      },
    ]),
  ],
  controllers: [OrderController],
})
export class AppModule {}
