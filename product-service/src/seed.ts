import { Repository } from 'typeorm';
import { Product } from './product.entity';

export async function seedProducts(repo: Repository<Product>) {
  const count = await repo.count();
  if (count > 0) {
    console.log('Products already seeded, skipping...');
    return;
  }

  const products = [
    { name: 'Laptop Dell XPS 15', price: 1500.0, stock: 10 },
    { name: 'iPhone 15 Pro', price: 1200.0, stock: 20 },
    { name: 'AirPods Pro 2', price: 250.0, stock: 50 },
    { name: 'Mechanical Keyboard', price: 120.0, stock: 30 },
    { name: 'Logitech MX Master 3', price: 100.0, stock: 25 },
  ];

  for (const p of products) {
    await repo.save(repo.create(p));
  }
  console.log(`Seeded ${products.length} products`);
}
