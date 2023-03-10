import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user";

import swaggerDocument from "./swagger.json";
import { IUser } from "./models/user";
import { Permission } from "accesscontrol";
dotenv.config();

declare global {
  export namespace Express {
    interface Query {
      [key: string]: string | string[] | undefined;
    }
    interface Request {
      user: {
        _id: Object;
      } & IUser;
    }
  }
}

mongoose
  .connect(process.env.MONGODB_URL as string)
  .then((val) => {
    console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });
mongoose.connection.on("connecting", function () {
  console.log("connecting to MongoDB...");
});

mongoose.connection.on("error", function (error) {
  console.error("Error in MongoDb connection: " + error);
  mongoose.disconnect();
});
mongoose.connection.on("connected", function () {
  console.log("MongoDB connected!");
});
mongoose.connection.once("open", function () {
  console.log("MongoDB connection opened!");
});
mongoose.connection.on("reconnected", function () {
  console.log("MongoDB reconnected!");
});

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
app.use(helmet());
app.use(cors());

app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
