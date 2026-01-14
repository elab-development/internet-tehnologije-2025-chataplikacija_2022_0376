import { User } from '../entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      userId?: string;
      userRole?: string;
      file?: Multer.File;
      files?: Multer.File[];
    }
  }
}

export {};