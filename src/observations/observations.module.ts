import { Module } from '@nestjs/common';
import { ObservationsService } from './observations.service';
import { ObservationsController } from './observations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Observation, ObvervationSchema } from './schemas/observation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Observation.name, schema: ObvervationSchema },
    ]),
  ],
  controllers: [ObservationsController],
  providers: [ObservationsService],
  exports: [ObservationsService],
})
export class ObservationsModule {}
