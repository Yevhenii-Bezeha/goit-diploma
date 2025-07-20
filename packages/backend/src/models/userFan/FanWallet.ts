import mongoose, { Schema, Document } from 'mongoose';

export interface IFanWallet extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

const FanWalletSchema = new Schema<IFanWallet>(
  {
    userId: {
      type: String,
      required: true,
      unique: true
    },
    balance: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

const FanWallet = mongoose.model<IFanWallet>('FanWallet', FanWalletSchema);

export default FanWallet;
