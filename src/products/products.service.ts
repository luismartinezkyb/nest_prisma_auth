import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { DbService } from 'src/db/db.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductImageInterface } from './interfaces/product-image.interface';

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
      const { images, ...body } = createProductDto;
      // console.log(body);
      const product = await this.dbService.product.create({
        data: body,
      });
      const imagesSaved = await this.dbService.productImages.createMany({
        data: [
          ...images.map((image) => ({
            url: image,
            productId: product.id,
          })),
        ],
      });
      console.log(imagesSaved);
      return product;
    } catch (error) {
      this.handleProductError(error);
    }
  }

  async findAll({ limit = 10, offset = 0 }: PaginationDto) {
    // const queryBuilder = await this.dbService.$queryRaw(
    //   Prisma.sql``,
    // );
    // queryBuilder('SELECT * FROM ')
    // console.log(queryBuilder);
    return this.dbService.product.findMany({
      take: limit,
      skip: offset,
    });
    //offset and limit
    //skip:3,
    // take:4
  }

  async findOne(id: string) {
    console.log(isNaN(parseInt(id)));
    let whereStatement = {};
    if (isNaN(parseInt(id))) {
      whereStatement = { slug: id };
    } else {
      whereStatement = { id: +id };
    }
    console.log(whereStatement);
    const product = await this.dbService.product.findFirst({
      where: whereStatement,
      include: {
        images: {
          // distinct
          select: {
            url: true,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException('NOT_FOUND');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.findOne(id);
      if (!product) throw new NotFoundException('NOT_FOUND');
      return await this.dbService.$transaction(async (tx) => {
        // SPREAD THE IMAGES FROM THE BODY
        const { images, ...body } = updateProductDto;
        if (images && images.length > 0) {
          const imagesDeleted = await tx.productImages.deleteMany({
            where: {
              productId: product.id,
            },
          });
          // console.log({ imagesDeleted });
          const imagesSaved = await tx.productImages.createMany({
            data: [
              ...images.map((image) => ({
                url: image,
                productId: product.id,
              })),
            ],
          });
          // console.log(imagesSaved);
        }
        const updatedProduct = await tx.product.update({
          where: { id: product.id },
          data: body,
        });
        return updatedProduct;
      });
    } catch (error) {
      this.handleProductError(error);
    }
  }

  async remove(id: string) {
    try {
      //SUELTA UN CATCH SI ES QUE NO EXISTE
      const product = await this.findOne(id);
      return this.dbService.product.delete({ where: { id: +id } });
    } catch (error) {
      this.handleProductError(error);
    }
  }

  private handleProductError(error) {
    this.logger.error(error);
    if (error.message === 'NOT_FOUND')
      throw new NotFoundException('Product Not Found');
    if (error.code === 'P2002') throw new ConflictException('Title or Slug duplicated');
    throw new BadRequestException('Something went wrong in updateProduct');
  }
}
