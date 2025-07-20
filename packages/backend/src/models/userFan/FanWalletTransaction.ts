import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFanWalletTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  fanWalletId: mongoose.Types.ObjectId;
  userId: string;
  pieId?: string;
  amount: number;
  transaction_type: 'credit' | 'debit';
  status: 'pending' | 'processed' | 'failed';
  charge_id?: string;
  source:
  | 'subscription_payment'
  | 'pie_payment'
  | 'pie_refund'
  | 'manual_credit'
  | 'wallet_transfer'
  | 'promotional_pie';
  pie_reference?: string;
  date: Date;
  metadata?: {
    subscription_id?: string;
    invoice_id?: string;
    pie_details?: {
      pie_id: string;
      start_date: Date;
      end_date: Date;
      amount: number;
    };
    refund_details?: {
      reason: string;
      original_pie_id: string;
    };
    stripe_details?: {
      charge_id?: string;
      balance_transaction_id?: string;
      fee_amount?: number;
      net_amount?: number;
    };
  };
}

interface IFanWalletTransactionModel extends Model<IFanWalletTransaction> {
  findPendingByUserId(userId: string): Promise<IFanWalletTransaction[]>;
  findByFanWallet(fanWalletId: string): Promise<IFanWalletTransaction[]>;
  findCreditsByUserId(userId: string): Promise<IFanWalletTransaction[]>;
  findDebitsByUserId(userId: string): Promise<IFanWalletTransaction[]>;
}

const FanWalletTransactionSchema = new Schema<IFanWalletTransaction>(
  {
    fanWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FanWallet',
      required: true
    },
    userId: { type: String, required: true },
    pieId: { type: String },
    amount: { type: Number, required: true },
    transaction_type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    },
    charge_id: { type: String },
    source: {
      type: String,
      enum: [
        'subscription_payment',
        'pie_payment',
        'pie_refund',
        'manual_credit',
        'wallet_transfer',
        'promotional_pie'
      ],
      required: true
    },
    pie_reference: { type: String },
    date: { type: Date, default: Date.now },
    metadata: {
      subscription_id: { type: String },
      invoice_id: { type: String },
      pie_details: {
        pie_id: { type: String },
        start_date: { type: Date },
        end_date: { type: Date },
        amount: { type: Number }
      },
      refund_details: {
        reason: { type: String },
        original_pie_id: { type: String }
      },
      stripe_details: {
        charge_id: { type: String },
        balance_transaction_id: { type: String },
        fee_amount: { type: Number },
        net_amount: { type: Number }
      }
    }
  },
  { timestamps: true }
);

FanWalletTransactionSchema.statics.findPendingByUserId = function (
  userId: string
) {
  return this.find({ userId, status: 'pending' });
};

FanWalletTransactionSchema.statics.findByFanWallet = function (
  fanWalletId: string
) {
  return this.find({ fanWalletId });
};

FanWalletTransactionSchema.statics.findCreditsByUserId = function (
  userId: string
) {
  return this.find({ userId, transaction_type: 'credit' });
};

FanWalletTransactionSchema.statics.findDebitsByUserId = function (
  userId: string
) {
  return this.find({ userId, transaction_type: 'debit' });
};

const FanWalletTransaction = mongoose.model<
  IFanWalletTransaction,
  IFanWalletTransactionModel
>('FanWalletTransaction', FanWalletTransactionSchema);

export default FanWalletTransaction;
