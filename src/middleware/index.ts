import { Request, NextFunction, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import * as dotenv from "dotenv";
import aws from "aws-sdk";
import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import User, { IUser } from "../models/user";
import { roles } from "../permissions/roles";
dotenv.config();

export const s3Config = new S3Client({
  region: process.env.S3_BUCKET_REGION as string,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY as string,
    secretAccessKey: process.env.S3_ACCESS_SECRET as string,
  },
});

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY as string,
  secretAccessKey: process.env.S3_ACCESS_SECRET as string,
  region: process.env.S3_BUCKET_REGION as string,
});

export const s3DeleteImageHelper = (key: string) => {
  s3.deleteObject(
    {
      Bucket: process.env.S3_BUCKET as string,
      Key: key,
    },
    (err, data) => {
      if (err) {
        console.error("err", err);
      }
    }
  );
};

export const upload = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: process.env.S3_BUCKET as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, "images/" + Date.now().toString() + "-" + file.originalname);
    },
  }),
});

export const tokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1] as string;
  try {
    const userId = jwt.verify(
      token,
      process.env.PRIVATE_KEY as string
    ) as jwt.JwtPayload;
    let user = await User.findById(userId?._id);
    if (!user) {
      res.status(400).json({ error: "wrong credentials" });
    } else {
      req.user = user;
      next();
    }
  } catch (error: any) {
    let errors = error as JsonWebTokenError;
    res.status(500).json({ error: errors.message });
  }
};

export const grantAccess = (action: string, resource: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permission = roles.can(req.user.role)[action](resource);
      if (!permission.granted) {
        return res.status(401).json({
          error: "You don't have enough permission to perform this action",
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

type Permission = "basic" | "read" | "create" | "edit" | "delete";

export const permissionMiddleware = (permissions: Permission[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser;

      // check if the user has at least one of the required permissions
      const hasPermission = permissions.some(
        (permission) => user.role === permission
      );

      if (!hasPermission) {
        return res
          .status(403)
          .json({ message: "You are not authorized to access this resource" });
      }

      // if the user has the required permission, allow access to the protected route
      return next();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
