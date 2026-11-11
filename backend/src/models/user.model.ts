import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export enum LoginProvider {
  LOCAL = "local",
  GOOGLE = "google",
}

export interface IUser extends Document {
  name: string;
  email: string;
  image: string;
  password: string;
  loginProvider: LoginProvider;
  refreshToken: string | null;
  subscription: Date | null;
  freeRequestsUsed: number;
  isVerified:boolean;
  hasProAccess(): boolean;
  canMakeRequest(): boolean;
  comparePassword(candidate: string): Promise<boolean>;
}

const schema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true,minLength:5,maxLength:50 },
    email: { type: String, required: true, unique: true,lowercase:true,trim:true },
    image: { type: String, default: "" },
    password: { type: String, select: false },
    refreshToken: { type: String, default: null, select: false },
    subscription: { type: Date, default: null },
    freeRequestsUsed: { type: Number, default: 0 },
    loginProvider: {
      type: String,
      enum: Object.values(LoginProvider),
      required: true,
      default: LoginProvider.LOCAL,
    },
    isVerified : {
      type:Boolean,
      default:false
    }
  },
  { timestamps: true },
);

schema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

schema.methods.comparePassword = async function (
  candidate: string,
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

schema.methods.hasProAccess = function (): boolean {
  return !!this.subscription && new Date() < new Date(this.subscription);
};

schema.methods.canMakeRequest = function () {
  if (this.hasProAccess()) return true;
  return this.freeRequestsUsed < 3; 
};

export const User = mongoose.model<IUser>("User", schema);
