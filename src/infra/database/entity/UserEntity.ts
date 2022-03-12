import { mongoose } from "../MondoDBAdapter/infra";
export interface IUser {
  name: string;
}

const UserEntity = {
  ['#']: String,
  ['(VLTRR$)*']: String,
  COD: String,
  DESCRIÇÃO: String,
  QTD: String,
  UN: String,
  VLITEMR$: String,
  VLUNR$: String,
};

export const User = mongoose.model("user", new mongoose.Schema(UserEntity));
