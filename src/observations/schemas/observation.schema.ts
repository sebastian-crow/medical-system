import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ExtendedData } from 'src/users/schemas/object.interface';

export type ObservationDocument = Observation & Document;

@Schema()
export class Observation {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: false })
  healthStatus: string;

  @Prop({ type: String, required: false })
  medicalSpecialty: string;

  @Prop({ type: JSON, required: false })
  hospital: ExtendedData;

  @Prop({ type: JSON, required: false })
  doctor: ExtendedData;

  @Prop({ type: JSON, required: false })
  patient: ExtendedData;
}

export const ObvervationSchema = SchemaFactory.createForClass(Observation);
