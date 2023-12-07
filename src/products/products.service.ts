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

  async findAll() {
    return this.dbService.product.findMany({});
  }

  async findOne(id: number) {
    return this.dbService.product.findFirst({
      where: {
        id,
      },
    });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.findOne(id);
      if (!product) throw new NotFoundException('NOT_PRODUCT');

      const updatedProduct = await this.dbService.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      this.logger.error(error);
      if (error.message === 'NOT_PRODUCT')
        throw new NotFoundException('Product Not Found');

      throw new BadRequestException('Something went wrong in updateProduct');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }

  private handleExceptions(error: any) {}
}
