import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: join(__dirname, 'proto/order.proto'),
        url: '0.0.0.0:50052',
        loader: {
          keepCase: true,
        },
      },
    },
  );
  await app.listen();
  console.log('✅ Order Service is running on gRPC port 50052');
}
bootstrap();
