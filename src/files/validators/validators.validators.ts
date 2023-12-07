import { FileTypeValidator, MaxFileSizeValidator } from "@nestjs/common";

export const ValidatorPipeFile = [
  new MaxFileSizeValidator({ maxSize: 2000 }),
  new FileTypeValidator({ fileType: 'image/jpeg' }),
];
