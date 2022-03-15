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
    type: Boolean,
  },
  date_processed: {
    type: Date,
  },
  date_created: {
    type: String,
  },
  nota: {
    type: Object,
  },
};

export const User = mongoose.model('user', new mongoose.Schema(CodeEntity));
