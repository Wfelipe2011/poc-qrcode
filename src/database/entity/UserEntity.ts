import mongoose from 'mongoose';
export interface IUser {
  name: string;
}

const CodeEntity = {
  email: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    unique: true,
  },
  status: {
    type: String,
  },
  dateProcessed: {
    type: Date,
  },
  dateCreated: {
    type: String,
  },
  note: {
    type: Object,
  },
};

export const User = mongoose.model('user', new mongoose.Schema(CodeEntity));
