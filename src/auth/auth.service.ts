import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Inject,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { CreateObservationDto } from 'src/observations/dto/create-observation.dto';
import { ObservationsService } from 'src/observations/observations.service';
import * as argon2 from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthDto } from './dto/auth.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { IJwtPayload } from './dto/jwt-payload.interface';
import { Role } from 'src/users/schemas/role.enum';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { join } from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit-table');

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private usersService: UsersService,
    private obvervationsService: ObservationsService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  /* User methods */
  async signUp(createUserDto: CreateUserDto): Promise<any> {
    /* Check if user exists */
    const userExists = await this.usersService.findByUsername(
      createUserDto.email,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    /* Validate the same email  */
    if (createUserDto.email !== createUserDto.emailConfirmation) {
      throw new BadRequestException('Confirm your email');
    }

    /* Validate role  */
    if (createUserDto.role === Role.DOCTOR) {
      throw new BadRequestException("You can't create this roletype user");
    }

    /* Hash password  */
    const hash = await this.hashData(createUserDto.password);
    const newUser = await this.usersService.create({
      ...createUserDto,
      password: hash,
    });
    const tokens = await this.getTokens(newUser._id, newUser.email);
    await this.updateRefreshToken(newUser._id, tokens.refreshToken);

    /* JWT Payload to sign  */
    const payload: IJwtPayload = {
      id: newUser._id,
      email: newUser.email,
      document: newUser.document,
      name: newUser.name,
      role: newUser.role,
    };
    const token = await this.jwtService.sign(payload);
    return { token };
  }

  /*  Create doctor only by HOSPITAL */
  async signUpDoctor(createUserDto: CreateUserDto): Promise<any> {
    /* Check if user exists  */
    const userExists = await this.usersService.findByUsername(
      createUserDto.email,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    /* Validate the same email */
    if (createUserDto.email !== createUserDto.emailConfirmation) {
      throw new BadRequestException('Confirm your email');
    }

    const newUser = await this.usersService.create({
      ...createUserDto,
    });
    /* Refresh tokens  */
    const tokens = await this.getTokens(newUser._id, newUser.email);
    await this.updateRefreshToken(newUser._id, tokens.refreshToken);

    return tokens;
  }

  /* HOSPITAL and PATIENT signin  */
  async signIn(data: AuthDto): Promise<any> {
    // Check if user exists
    const user = await this.usersService.findByDocument(data.document);
    if (!user) throw new BadRequestException('User does not exist');
    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(user._id, user.email, user);
    await this.updateRefreshToken(user._id, tokens.refreshToken);
    /* return tokens; */

    /* JWT Payload to sign */
    const payload: IJwtPayload = {
      id: user._id,
      email: user.email,
      document: user.document,
      name: user.name,
      role: user.role,
    };
    const token = await this.jwtService.sign(payload);
    return { token };
  }

  /* This service checks if the user with doctor role has a password 
    and matches them to log in, if not the argument passed as password 
    will update his password once
  */
  async signInDoctor(data: AuthDto): Promise<any> {
    // Check if user exists
    const user = await this.usersService.findByDocument(data.document);
    if (!user) throw new BadRequestException('User does not exist');

    /* 
      If the user has password, the verification starts, otherwise 
      the doctor can login without password
    */
    if (user.password) {
      const passwordMatches = await argon2.verify(user.password, data.password);
      if (!passwordMatches)
        throw new BadRequestException('Password is incorrect');
    } else {
      const hash = await this.hashData(data.password);
      const newUser: UpdateUserDto = {
        ...data,
        password: hash,
      };
      return await this.usersService.update(user._id, newUser);
    }

    const tokens = await this.getTokens(user._id, user.email, user);
    await this.updateRefreshToken(user._id, tokens.refreshToken);
    /*     return tokens; */
    const payload: IJwtPayload = {
      id: user._id,
      email: user.email,
      document: user.document,
      name: user.name,
      role: user.role,
    };
    const token = await this.jwtService.sign(payload);
    return { token };
  }

  /* User Password Recovery */
  async recovery(data: UpdateUserDto): Promise<any> {
    // Check the user
    const user = await this.usersService.findByDocument(data.document);
    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await argon2.verify(user.password, data.password);
    if (!passwordMatches)
      throw new BadRequestException(
        'You must pass the previous password in order to reset the user password',
      );

    const hash = await this.hashData(data.newPassword);
    const newUser = {
      ...data,
      password: hash,
    };
    return await this.usersService.update(user._id, newUser);
  }

  /* Refresh the JWT tokens */
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');
    const refreshTokenMatches = await argon2.verify(
      user.refreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  hashData(data: string) {
    return argon2.hash(data);
  }

  /* Update the JWT tokens */
  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string, user?: UserDocument) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          user,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          user,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /* Registry Observations Methods */
  async createObservation(
    createObservationDto: CreateObservationDto,
  ): Promise<any> {
    return await this.obvervationsService.create(createObservationDto);
  }

  /* Obtain observations based on the current user's role */
  async getObservations() {
    const observations = await this.obvervationsService.findAll();

    const { user }: any = this.request; // CURRENT USER

    return observations.map((observation) => {
      // Doctor
      if (observation.doctor.document === user.document) {
        return observation;
      }
      // Patient
      if (observation.patient.document === user.document) {
        return observation;
      }
      // Hospital
      if (observation.hospital.document === user.document) {
        return observation;
      }
    });
  }

  /* This function will generate a PDF file with all observations by user */
  async genReport(id: string): Promise<Buffer> {
    const observations = await this.obvervationsService.findAll();
    const user = await this.usersService.findByDocument(Number(id));
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        bufferPages: true,
        autoFirstPage: false,
      });

      let pageNumber = 0;
      doc.on('pageAdded', () => {
        pageNumber++;
        const bottom = doc.page.margins.bottom;

        if (pageNumber > 1) {
          doc.image(
            join(process.cwd(), 'resources/img/heippi.png'),
            doc.page.width - 100,
            5,
            { fit: [45, 45], align: 'center' },
          );
          doc
            .moveTo(50, 55)
            .lineTo(doc.page.width - 50, 55)
            .stroke();
        }

        doc.page.margins.bottom = 0;
        doc.font('Helvetica').fontSize(14);
        doc.text(
          'Pág. ' + pageNumber,
          0.5 * (doc.page.width - 100),
          doc.page.height - 50,
          {
            width: 100,
            align: 'center',
            lineBreak: false,
          },
        );
        doc.page.margins.bottom = bottom;
      });

      doc.addPage();
      doc.image(
        join(process.cwd(), 'resources/img/heippi.png'),
        doc.page.width / 2 - 100,
        150,
        { width: 200 },
      );
      doc.text('', 0, 400);
      doc.font('Helvetica-Bold').fontSize(24);
      doc.text('Heippi Medical System', {
        width: doc.page.width,
        align: 'center',
      });
      doc.moveDown();

      doc.addPage();
      doc.text('', 50, 70);
      doc.font('Helvetica-Bold').fontSize(20);
      doc.text('Observaciones');
      doc.moveDown();
      doc.font('Helvetica').fontSize(16);
      doc.text(
        'Documento generado a partir de las observaciones almacenadas en la base de datos',
      );

      doc.addPage();
      doc.text('', 50, 70);
      doc.fontSize(24);
      doc.moveDown();
      doc.font('Helvetica').fontSize(20);
      doc.text('Resumen', {
        width: doc.page.width - 100,
        align: 'center',
      });

      const patientObservations = observations.filter((observation) => {
        if (observation.patient.document === user.document) {
          return observation;
        }
      });

      const rowObservations = [];
      patientObservations.forEach((element) => {
        const temp_list = [
          element?.name,
          element?.description,
          element?.healthStatus,
          element?.patient.name,
          element?.doctor.name,
          element?.hospital.name,
        ];
        rowObservations.push(temp_list);
      });
      const table = {
        title: 'Observaciones',
        headers: [
          'name',
          'description',
          'healthStatus',
          'patient',
          'doctor',
          'hospital',
        ],
        rows: rowObservations,
      };

      doc.table(table); // { columnsSize: [150, 350] }

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
      doc.end();
    });

    return pdfBuffer;
  }
}
