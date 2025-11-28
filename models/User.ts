import mongoose, { Schema, models, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  avatar?: string;
  likedRecipes: mongoose.Types.ObjectId[];
  createdAt: Date;
  resetOTP?: string;
  resetOTPExpiry?: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    select: false,
  },
  image: String,
  avatar: String,
  likedRecipes: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetOTP: {
    type: String,
    select: false,
  },
  resetOTPExpiry: {
    type: Date,
    select: false,
  },
});

const User = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;