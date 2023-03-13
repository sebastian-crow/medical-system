import { Role } from 'src/users/schemas/role.enum';

export interface IJwtPayload {
  id: string;
  name: string;
  document: number;
  email?: string;
  role: Role;
  iat?: Date;
}
