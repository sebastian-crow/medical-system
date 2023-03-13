import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe,
  StreamableFile,
} from '@nestjs/common';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { CreateObservationDto } from 'src/observations/dto/create-observation.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { Roles, ROLES_KEY } from './decorators/roles.decorator';
import { Role } from 'src/users/schemas/role.enum';
import { RolesGuard } from './guards/roles.guard';
import { AuthDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // User controller routes
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  // Just HOSPITAL can create doctors
  @Post('signup/doctor')
  @Roles(Role.HOSPITAL)
  @UseGuards(AuthGuard(), RolesGuard)
  signupDoctor(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUpDoctor(createUserDto);
  }

  // All users signin
  @Post('signin')
  signin(@Body() data: AuthDto) {
    return this.authService.signIn(data);
  }

  /* 
    Doctor signin
    At first signin the field password can be empty
    and the next time could be changed
  */
  @Post('signin/doctor')
  signinDoctor(@Body() data: AuthDto) {
    return this.authService.signInDoctor(data);
  }

  /* 
    All users recovery password
  */
  @Roles(Role.DOCTOR, Role.HOSPITAL, Role.PATIENT)
  @UseGuards(AuthGuard(), RolesGuard)
  @Patch('recovery')
  recovery(@Body() data: AuthDto) {
    return this.authService.recovery(data);
  }

  /* Refresh JWT tokens */
  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }

  /* Observation controller routes */
  @Roles(Role.DOCTOR, Role.HOSPITAL)
  @UseGuards(AuthGuard(), RolesGuard)
  @Post('observations')
  observations(@Body() createObservationDto: CreateObservationDto) {
    return this.authService.createObservation(createObservationDto);
  }

  /* Get observations by patient */
  @Roles(Role.DOCTOR, Role.HOSPITAL, Role.PATIENT)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('observations')
  getObservations() {
    return this.authService.getObservations();
  }

  // Download the observations
  @Roles(Role.DOCTOR, Role.HOSPITAL, Role.PATIENT)
  @UseGuards(AuthGuard(), RolesGuard)
  @Get('observations/download/:id')
  async downloadPDF(@Param('id') id: string, @Res() res): Promise<void> {
    const buffer = await this.authService.genReport(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=example.pdf',
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
