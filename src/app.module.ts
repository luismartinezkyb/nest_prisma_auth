import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { DbModule } from './db/db.module';

@Module({
  imports: [ConfigModule.forRoot(), ProductsModule, DbModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
