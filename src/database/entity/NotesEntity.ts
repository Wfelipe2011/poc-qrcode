import mongoose from 'mongoose';

const NotesEntity = {
  key: {
    type: String,
    required: true,
  },
  clientId: {
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
    type: Date,
  },
  note: {
    type: Object,
  },
};

export const Notes = mongoose.model('notes', new mongoose.Schema(NotesEntity));
