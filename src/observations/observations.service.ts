import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateObservationDto } from './dto/create-observation.dto';
import { UpdateObservationDto } from './dto/update-observation.dto';
import { Observation, ObservationDocument } from './schemas/observation.schema';

@Injectable()
export class ObservationsService {
  constructor(
    @InjectModel(Observation.name)
    private observationModel: Model<ObservationDocument>,
  ) {}

  async create(
    CreateObservationDto: CreateObservationDto,
  ): Promise<ObservationDocument> {
    const createdObservation = new this.observationModel(CreateObservationDto);
    return createdObservation.save();
  }

  async findAll(): Promise<ObservationDocument[]> {
    return this.observationModel.find().exec();
  }

  async findById(id: string): Promise<ObservationDocument> {
    return this.observationModel.findById(id);
  }

  async findByUsername(name: string): Promise<ObservationDocument> {
    return this.observationModel.findOne({ name }).exec();
  }

  async update(
    id: string,
    updateObservationDto: UpdateObservationDto,
  ): Promise<ObservationDocument> {
    return this.observationModel
      .findByIdAndUpdate(id, updateObservationDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<ObservationDocument> {
    return this.observationModel.findByIdAndDelete(id).exec();
  }
}
