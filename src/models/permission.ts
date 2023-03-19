import mongoose, { Document, Model } from "mongoose";

export interface IPermission extends Document {
  name: string;
  roles: string[];
}

interface IPermissionModel extends Model<IPermission> {}

const PermissionSchema = new mongoose.Schema<IPermission, IPermissionModel>({
  name: { type: String, required: true, unique: true },
  roles: [
    {
      type: String,
      default: "read",
      enum: ["read", "create", "edit", "delete"],
    },
  ],
});

const PermissionModel = mongoose.model<IPermission, IPermissionModel>(
  "Permission",
  PermissionSchema
);

export default PermissionModel;
