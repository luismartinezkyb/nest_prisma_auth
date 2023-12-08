import { Request } from 'express';
import crypto from 'crypto';
export const fileNamer = (
  req: Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File empty'), false);

  const fileExtension = file.originalname.split('.').pop();
  const name = new Date().toISOString();
  console.log({ name });
  const fileName = `${name}.${fileExtension}`;
  console.log(fileExtension);
  callback(null, fileName);
};
