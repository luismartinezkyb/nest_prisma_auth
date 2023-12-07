import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from './products/products.module';
import { DbModule } from './db/db.module';
import { CommonModule } from './common/common.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [ConfigModule.forRoot(), ProductsModule, DbModule, CommonModule, FilesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
