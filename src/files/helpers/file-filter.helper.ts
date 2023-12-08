import { Request } from 'express';

export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  console.log(!!file)
  if (!file) return callback(new Error('File empty'), false);

  const fileExtension = file.originalname.split('.').pop();
  console.log(fileExtension);
  const validExtensions = ['jpg', 'png', 'gif', 'jpeg'];
  console.log(validExtensions.includes(fileExtension));
  if (validExtensions.includes(fileExtension)) {
    return callback(null, true);
  }
  callback(null, false);
};
