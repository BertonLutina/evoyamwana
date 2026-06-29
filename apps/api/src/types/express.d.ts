import type { AuthUser } from '@evoyamwana/shared';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
