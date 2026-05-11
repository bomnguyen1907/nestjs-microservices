import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { seedProducts } from './seed';

async function bootstrap() {
  // Tạo app context tạm để seed data
  const { NestFactory: NF } = await import('@nestjs/core');
  const appContext = await NF.createApplicationContext(AppModule);
  const productRepo = appContext.get<Repository<Product>>(
    getRepositoryToken(Product),
  );
  await seedProducts(productRepo);
  await appContext.close();

  // Khởi động gRPC microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'product',
        protoPath: join(__dirname, 'proto/product.proto'),
        url: '0.0.0.0:50051',
        loader: {
          keepCase: true,
        },
      },
    },
  );
  await app.listen();
  console.log('✅ Product Service is running on gRPC port 50051');
}
bootstrap();
