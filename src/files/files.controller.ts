import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidatorPipeFile } from './validators/validators.validators';
import { fileFilter } from './helpers/file-filter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/file-namer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  //USING FILEFILTER
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 },
      storage: diskStorage({
        destination: './static/uploads/',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not Accepted');
    }
    const secureURL = `${this.configService.get('HOST_API')}/files/${
      file.filename
    }`;
    return {
      secureURL,
    };
  }
  //USING PIPES
  @Post('/new')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile2(
    @UploadedFile(
      new ParseFilePipe({
        validators: ValidatorPipeFile,
      }),
    )
    file: Express.Multer.File,
  ) {
    return {
      fileName: file.fieldname,
    };
  }

  @Get(':name')
  getFile(@Res() res: Response, @Param('name') imageName: string) {
    const path = this.filesService.getOneFile(imageName);

    res.sendFile(path);
  }
}
