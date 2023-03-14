import mongoose, { Document, Model, Types } from "mongoose";
import { IUser } from "./user";

export interface IPermission extends Document {
name: string;
description: string;
}

export interface IActivity extends Document {
ip: number;
action: string;
time: Date;
user: Types.ObjectId | IUser;
}

interface IActivityModel extends Model<IActivity> {}

const PermissionSchema = new mongoose.Schema<IPermission>(
{
name: { type: String, required: true },
description: { type: String, required: true },
},
{ timestamps: true }
);

const PermissionModel = mongoose.model<IPermission>("Permission", PermissionSchema);

const createAdminPermission = async () => {
const existingPermission = await PermissionModel.findOne({ name: "admin" });
if (!existingPermission) {
await PermissionModel.create({
name: "admin",
description: "Full administrative access",
});
}
};

createAdminPermission();

const ActivitySchema = new mongoose.Schema<IActivity, IActivityModel>(
{
action: { type: String, required: true },
ip: { type: Number, required: true },
time: { type: Date },
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
},
},
{ timestamps: true }
);

ActivitySchema.statics.createActivity = async function(
user: IUser,
activity: IActivity
): Promise<IActivity> {
const permission = await PermissionModel.findOne({ name: "admin" });
if (user.permissions.includes(permission?.\_id)) {
return this.create(activity);
} else {
throw new Error("You do not have permission to create an activity");
}
};

const ActivityModel = mongoose.model<IActivity, IActivityModel>("Activity", ActivitySchema);

// Assign the "admin" permission to a user
const user = await UserModel.findOne({ email: "example@gmail.com" });
const adminPermission = await PermissionModel.findOne({ name: "admin" });
user.permissions.push(adminPermission.\_id);
await user.save();

// Create a new activity, only allowed by users with the "admin" permission
const newActivity = {
ip: 12345,
action: "Created a new post",
time: new Date(),
user: user.\_id,
};
await ActivityModel.createActivity(user, newActivity);
