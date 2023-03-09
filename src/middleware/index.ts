import { Request, NextFunction, Response } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";

import User from "../models/user";

export interface IRequest extends Request {
  userId: any;
}

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
      req.userId = userId._id;
      next();
    }
  } catch (error: any) {
    let errors = error as JsonWebTokenError;
    res.status(500).json({ error: errors.message });
  }
};
