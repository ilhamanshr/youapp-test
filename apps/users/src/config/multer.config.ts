import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = {
  storage: diskStorage({
    destination: './storage',
    filename(req, file, callback) {
      const randomString = req.params.id;
      const fileExtension = extname(file.originalname);
      const custumName = `${randomString}${fileExtension}`;
      callback(null, custumName);
    },
  }),
};
