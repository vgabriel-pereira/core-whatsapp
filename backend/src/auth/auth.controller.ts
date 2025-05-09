import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.username, loginDto.password);
    
    if (!user) {
      return { success: false, message: 'Usuário ou senha inválidos' };
    }
    
    return {
      success: true,
      message: 'Login realizado com sucesso',
      ...(await this.authService.login(user)),
    };
  }
}