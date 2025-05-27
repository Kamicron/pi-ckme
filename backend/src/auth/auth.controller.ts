import { Controller, Get, Req, Res, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req, @Res() res: Response) {
    try {
      this.logger.log('Google callback received');
      this.logger.log(`Request user: ${JSON.stringify(req.user)}`);
      
      const result = this.authService.googleLogin(req);
      this.logger.log(`Auth service result: ${JSON.stringify(result)}`);
      
      if (!result.user || !result.redirect) {
        this.logger.error('Authentication failed: missing user or redirect URL');
        // En cas d'erreur, redirigez vers la page de connexion du frontend
        return res.redirect(`${process.env.FRONT_URL || 'http://localhost:3000/'}login?error=auth_failed`);
      }

      const redirectUrl = `${result.redirect}?user=${encodeURIComponent(JSON.stringify(result.user))}`;
      this.logger.log(`Redirecting to: ${redirectUrl}`);
      
      // Rediriger vers le frontend avec les données utilisateur
      return res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error(`Error during Google authentication: ${error.message}`);
      this.logger.error(error.stack);
      return res.redirect(`${process.env.FRONT_URL || 'http://localhost:3000/'}login?error=server_error`);
    }
  }
}
