import { BadRequestException } from "@nestjs/common";
import mongoose from "mongoose";

export class MongoDBAdapter {
  constructor(readonly mongoose: mongoose.Model<any, {}, {}, {}>) {}

  getAll<T>(): mongoose.Query<T[], T, {}, any> {
    try {
      return this.mongoose.find<T>();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getOne<T>(obj): Promise<T> {
    try {
      return this.mongoose.findOne<T>(obj);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async save<T>(obj: T) {
    try {
      return await new this.mongoose(obj).save();
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id, obj) {
    try {
      await this.mongoose.updateOne({ _id: id }, obj);
      return this.mongoose.findById(id); // fim de consulta
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(
    id
  ): Promise<{ ok?: number; n?: number } & { deletedCount?: number }> {
    try {
      return this.mongoose.deleteOne({ _id: id });
    } catch (error) {
      throw new Error("Error! " + error.message);
    }
  }
}
