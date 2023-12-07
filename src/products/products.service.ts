import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DbService } from 'src/db/db.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(private readonly dbService: DbService) {}
  async create(createProductDto: CreateProductDto) {
    try {
      if (!createProductDto.slug) {
        createProductDto.slug = createProductDto.title
          .toLowerCase()
          .split(' ')
          .join('_');
      } else {
        createProductDto.slug = createProductDto.slug
          .toLowerCase()
          .split(' ')
          .join('_');
      }
      const product = await this.dbService.product.create({
        data: createProductDto,
      });
      return product;
    } catch (error) {
      this.logger.error(error);
      throw new InternalServerErrorException('Error creating product');
    }
  }

  async findAll({ limit = 10, offset = 0 }: PaginationDto) {
    return this.dbService.product.findMany({
      take: limit,
      skip: offset,
    });
    //offset and limit
    //skip:3,
    // take:4
  }

  async findOne(id: number) {
    const product = await this.dbService.product.findFirst({
      where: {
        id,
      },
    });
    if (!product) {
      throw new NotFoundException('NOT_FOUND');
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.findOne(id);
      if (!product) throw new NotFoundException('NOT_PRODUCT');

      const updatedProduct = await this.dbService.product.update({
        where: { id },
        data: updateProductDto,
      });
      return updatedProduct;
    } catch (error) {
      this.logger.error(error);
      if (error.message === 'NOT_PRODUCT')
        throw new NotFoundException('Product Not Found');

      throw new BadRequestException('Something went wrong in updateProduct');
    }
  }

  async remove(id: number) {
    try {
      //SUELTA UN CATCH SI ES QUE NO EXISTE
      const product = await this.findOne(id);
      return this.dbService.product.delete({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      if (error.message === 'NOT_FOUND') {
        throw new NotFoundException('Product Not Found');
      }
      throw new BadRequestException('Something went wrong in deleteProduct');
    }
  }

  private handleExceptions(error: any) {}
}
