import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from './role.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: false })
  name: string;

  @Prop({ type: String, required: false })
  password: string;

  @Prop({ type: String, required: false })
  refreshToken: string;

  @Prop({ required: false, unique: true })
  email: string;

  @Prop({ type: String, required: false })
  emailConfirmation: string;

  @Prop({ type: String, enum: Role, required: false })
  role: Role;

  @Prop({ type: Number, required: false })
  document: number;

  @Prop({ type: String, required: false })
  phone: string;

  @Prop({ type: String, required: false })
  address: string;

  // Just apply to HOSPITAL users
  @Prop({ type: String, required: false })
  medicalServices: string;

  // Doctor and Patient users
  @Prop({ type: Date, required: false })
  birthdate: Date;

  // Indirect reference from DOCTOR to HOSPITAL
  @Prop({ type: JSON, required: false })
  belongsTo: JSON;
}

export const UserSchema = SchemaFactory.createForClass(User);
