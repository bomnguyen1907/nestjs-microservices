import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductController } from './product.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'products',
      entities: [Product],
      synchronize: true, // tự tạo bảng — chỉ dùng cho dev
    }),
    TypeOrmModule.forFeature([Product]),
  ],
  controllers: [ProductController],
})
export class AppModule {}
