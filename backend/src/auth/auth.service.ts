import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
}

interface AuthResponse {
  message: string;
  user?: GoogleUser;
  redirect?: string;
}

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  googleLogin(req): AuthResponse {
    if (!req.user) {
      return {
        message: 'No user from google'
      };
    }

    const frontendUrl = this.configService.get('FRONT_URL');
    return {
      message: 'User information from google',
      user: req.user,
      redirect: frontendUrl
    };
  }
}
