import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DbService } from 'src/db/db.service';
import { compare, hash } from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(private dbService: DbService) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...rest } = createUserDto;
      const newPassword = await hash(password, 10);
      const user = await this.dbService.user.create({
        data: { ...rest, password: newPassword },
      });

      delete user.password;
      return user;
    } catch (error) {
      this.handleAuthtError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;
      const user = await this.dbService.user.findUnique({
        where: { email },
        select: {
          email: true,
          password: true,
        },
      });

      if (!user) throw new NotFoundException('NOT_FOUND');

      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) throw new BadRequestException('PASSWORD_MISMATCH');

      delete user.password;

      //TODO: GENERRAR EL TOKEN
      return user;
    } catch (error) {
      this.handleAuthtError(error);
    }
  }

  private handleAuthtError(error) {
    this.logger.error(error);
    if (error.message === 'NOT_FOUND')
      throw new NotFoundException('User Not Found');
    if (error.code === 'P2002') throw new ConflictException('Email duplicated');

    if (error.message === 'PASSWORD_MISMATCH')
      throw new UnauthorizedException('PASSWORD_MISMATCH');
    throw new BadRequestException('Something went wrong in auth Service');
  }
}
