import { ExtendedData } from 'src/users/schemas/object.interface';

export class CreateObservationDto {
  name: string;
  description: string;
  healthStatus: string;
  medicalSpecialty: string;
  hospital: ExtendedData;
  doctor: ExtendedData;
  patient: ExtendedData;
}
