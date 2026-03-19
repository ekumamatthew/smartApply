import { Injectable } from '@nestjs/common';
import { auth } from '../lib/auth';

@Injectable()
export class AuthService {
  getAuthInstance() {
    return auth;
  }
}
