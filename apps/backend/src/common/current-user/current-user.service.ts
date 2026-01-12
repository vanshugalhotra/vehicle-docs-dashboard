import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class CurrentUserService {
  userId: string | null = null;
  email: string | null = null;
}
