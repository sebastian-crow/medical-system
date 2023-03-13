export class CreateUserDto {
  name?: string;
  password?: string;
  newPassword?: string;
  refreshToken?: string;
  email: string;
  emailConfirmation?: string;
  role?: string;
  document?: number;
  phone?: string;
  address?: string;
  medicalServices?: string;
  birthdate?: Date;
  belongsTo?: JSON;
}
