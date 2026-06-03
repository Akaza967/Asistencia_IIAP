import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Autenticación (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  // Verificación de cuenta a través de correo electrónico
  @Get('verify/:token')
  async verifyAccount(@Param('token') token: string) {
    return this.authService.verifyAccount(token);
  }

  // Login Paso 1: Verificar correo
  @Post('login/step-1')
  @HttpCode(HttpStatus.OK)
  async validateEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.validateEmail(verifyEmailDto);
  }

  // Login Paso 2: Conexión Final (Contraseña -> JWT)
  @Post('login/step-2')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Login / Registro con Google
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.googleLogin(googleLoginDto);
  }

  // Recuperación de Contraseña - Solicitud
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  // Recuperación de Contraseña - Cambio
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Endpoint de prueba protegido
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }
}
