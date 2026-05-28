import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../common/utils/mailer.util';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: any) {
    const { email, password, full_name } = registerDto;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new BadRequestException('El correo ya está en uso.');

    const password_hash = await bcrypt.hash(password, 10);
    const verification_token = crypto.randomBytes(32).toString('hex');
    const verification_token_expires = new Date();
    verification_token_expires.setHours(verification_token_expires.getHours() + 24); // Expira en 24h

    const user = this.userRepository.create({
      email,
      password_hash,
      full_name,
      is_verified: false,
      verification_token,
      verification_token_expires,
    });

    await this.userRepository.save(user);

    // Enviar correo de verificación (SMTP)
    await sendVerificationEmail(user.email, user.full_name, verification_token);

    return { message: 'Usuario registrado. Por favor, verifique su correo.' };
  }

  // Verificar cuenta usando el token del correo
  async verifyAccount(token: string) {
    const user = await this.userRepository.findOne({ where: { verification_token: token } });
    
    if (!user) throw new NotFoundException('Token inválido o cuenta no encontrada');
    
    if (user.is_verified) throw new BadRequestException('La cuenta ya está verificada');

    if (user.verification_token_expires < new Date()) {
      throw new BadRequestException('El token de verificación ha expirado');
    }

    user.is_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await this.userRepository.save(user);

    return { message: 'Cuenta verificada exitosamente. Ya puede iniciar sesión.' };
  }

  // Paso 1: Valida existencia del correo y devuelve datos iniciales
  async validateEmail(verifyEmailDto: VerifyEmailDto) {
    const { email } = verifyEmailDto;
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) throw new UnauthorizedException('Correo no encontrado');
    if (!user.is_active) throw new UnauthorizedException('La cuenta está desactivada');
    
    return {
      email: user.email,
      full_name: user.full_name,
      photo_url: user.photo_url || null,
      is_verified: user.is_verified,
    };
  }

  // Paso 2: Valida contraseña y genera JWT
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    if (!user.is_active) throw new UnauthorizedException('La cuenta está desactivada');
    if (!user.is_verified) throw new UnauthorizedException('Cuenta no verificada. Por favor, revise su correo electrónico.');

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Solicitud para restablecer contraseña
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({ where: { email } });
    
    // Si el usuario no existe o está desactivado, igual devolvemos éxito para evitar enumeración de correos
    if (!user || !user.is_active) {
      return { message: 'Si el correo existe en nuestro sistema, se le ha enviado un enlace para restablecer la contraseña.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date();
    resetExpires.setHours(resetExpires.getHours() + 1); // Expira en 1 hora

    user.reset_password_token = resetToken;
    user.reset_password_expires = resetExpires;
    
    await this.userRepository.save(user);

    // Enviar correo asíncronamente
    await sendPasswordResetEmail(user.email, user.full_name, resetToken);

    return { message: 'Si el correo existe en nuestro sistema, se le ha enviado un enlace para restablecer la contraseña.' };
  }

  // Restablecer contraseña con el token
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    
    const user = await this.userRepository.findOne({ where: { reset_password_token: token } });
    
    if (!user) throw new BadRequestException('Token inválido');
    if (user.reset_password_expires < new Date()) throw new BadRequestException('El token ha expirado');

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await this.userRepository.save(user);

    return { message: 'Contraseña restablecida exitosamente. Ya puede iniciar sesión.' };
  }
}
