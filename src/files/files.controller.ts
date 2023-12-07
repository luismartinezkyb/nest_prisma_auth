import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  BadRequestException,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidatorPipeFile } from './validators/validators.validators';
import { fileFilter } from './helpers/file-filter.helper';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  //USING FILEFILTER
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 },
      storage: diskStorage({
        destination: './public/uploads/',
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not Accepted');
    }
    return {
      fileName: file.fieldname,
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
}
