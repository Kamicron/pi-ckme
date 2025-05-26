import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    const result = this.authService.googleLogin(req);
    
    if (!result.user || !result.redirect) {
      // En cas d'erreur, redirigez vers la page de connexion du frontend
      return res.redirect(`${process.env.FRONT_URL}login?error=auth_failed`);
    }

    // Rediriger vers le frontend avec les données utilisateur
    return res.redirect(`${result.redirect}?user=${encodeURIComponent(JSON.stringify(result.user))}`);
  }
}
