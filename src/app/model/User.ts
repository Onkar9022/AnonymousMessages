import mongoose, { Schema, Document, Model } from "mongoose";

// Message Interface
export interface IMessage extends Document {
  content: string;
  createdAt: Date;
}

// Message Schema
const MessageSchema: Schema<IMessage> = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// User Interface
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string | null;
  verifyCodeExpiry: Date | null;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  messages: IMessage[];
}

// User Schema
const UserSchema: Schema<IUser> = new Schema<IUser>({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  verifyCode: {
    type: String,
    default: "", // ✅ Allow clearing after verification
  },
  verifyCodeExpiry: {
    type: Date,
    default: null, // ✅ Allow null after verification
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [MessageSchema],
});

// Proper Model typing
const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default UserModel;
