import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '@prisma/client';
import { GetHeaders } from './decorators/get-headers.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';
import { ApiBearerAuth, ApiCreatedResponse, ApiForbiddenResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() req: Express.Request,
    // @GetUser(['email']) user: User,
    @GetUser() user: User,
    // @GetUser('email') userEmail: string,
    @GetHeaders() headers: string[],
    @Headers() headersHttp: IncomingHttpHeaders,
  ) {
    console.log(user, headers, headersHttp);
    return {
      ok: true,
      message: 'Hola mundo private',
      user,
    };
  }
  //META DATA AUTHORIZATION
  
  @Get('/private2')
  // @SetMetadata('roles', ['admin', 'super-user', 'user'])
  //GUARD UserRoleGuard
  @RoleProtected(ValidRoles.user)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hola mundo private2',
      user,
    };
  }
  @ApiBearerAuth()
  @Get('/private3')
  @Auth(ValidRoles.admin, ValidRoles.user)
  privateRoute3(@GetUser() user: User) {
    return {
      ok: true,
      message: 'Hola mundo private2',
      user,
    };
  }
}
