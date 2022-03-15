import { BadRequestException } from '@nestjs/common';
import mongoose from 'mongoose';
import { ICustomerCaseRepository } from 'src/interface/ICustomerCaseRepository';

export class Repository implements ICustomerCaseRepository {
  constructor(private entity: mongoose.Model<any, {}, {}, {}>) {}

  async find<T>(filter = {}, obj = {}): Promise<T[]> {
    return await this.entity.find(filter, obj);
  }

  async findOne<T>(filter = {}, obj = {}): Promise<T> {
    return await this.entity.findOne(filter, obj);
  }

  async save<T>(obj: T): Promise<T> {
    return await new this.entity(obj).save();
  }

  async update<T>(filter, obj: T): Promise<T> {
    try {
      await this.entity.updateOne(filter, obj);
      return await this.entity.findOne(filter, obj);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(
    id: string,
  ): Promise<{ ok?: number; n?: number } & { deletedCount?: number }> {
    try {
      return this.entity.deleteOne({ _id: id });
    } catch (error) {
      throw new Error('Error! ' + error.message);
    }
  }
}
