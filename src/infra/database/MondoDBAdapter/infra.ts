import * as mongoose from "mongoose";
import { logger } from "skyot";
export { mongoose };

const connectionCloud = `mongodb+srv://site-tegra-admin:${process.env.PASSWORD_DATABASE}@site-tegra.30ahy.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`;

export class MongoDBConect {
  static async startMongo() {
    await mongoose
      .connect(connectionCloud)
      .then(() => {
        logger("Conectado ao Banco MongoDB");
      })
      .catch((error) => {
        logger(`${error}: Erro ao conectar!`);
      });
  }
}
