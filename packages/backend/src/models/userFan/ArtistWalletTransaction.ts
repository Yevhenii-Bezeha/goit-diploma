import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArtistWalletTransaction extends Document {
  _id: mongoose.Types.ObjectId;
  artistWalletId: mongoose.Types.ObjectId;
  artistId: string;
  fan_customer_id?: string;
  fan_user_id?: string;
  pieId?: string;
  amount: number;
  transaction_type: 'money_in' | 'money_out';
  status: 'processed';
  charge_id?: string;
  transfer_id?: string;
  payout_reference?: string;
  date: Date;
  fanWalletTransactionId?: string;
  source:
  | 'pie_distribution'
  | 'artist_payout'
  | 'manual_adjustment';
  metadata?: {
    artist_name?: string;
    time_listened?: number;
    total_tracks_listened?: number;
    percentage?: string;
    total_artists_count?: number;
    total_transactions_processed?: number;
    fee_amount?: number;
    net_amount?: number;
    gross_amount?: number;
    payout_breakdown?: {
      gross: number;
      fee: number;
      net: number;
    };
  };
}

interface IArtistWalletTransactionModel
  extends Model<IArtistWalletTransaction> {
  findByArtistId(artistId: string): Promise<IArtistWalletTransaction[]>;
  findByArtistWallet(
    artistWalletId: string
  ): Promise<IArtistWalletTransaction[]>;
  findMoneyInByArtistId(artistId: string): Promise<IArtistWalletTransaction[]>;
  findMoneyOutByArtistId(artistId: string): Promise<IArtistWalletTransaction[]>;
}

const ArtistWalletTransactionSchema = new Schema<IArtistWalletTransaction>(
  {
    artistWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ArtistWallet',
      required: true
    },
    artistId: { type: String, required: true },
    fan_customer_id: { type: String },
    fan_user_id: { type: String },
    pieId: { type: String },
    amount: { type: Number, required: true },
    transaction_type: {
      type: String,
      enum: ['money_in', 'money_out'],
      required: true
    },
    status: {
      type: String,
      enum: ['processed'],
      default: 'processed',
      required: true
    },
    charge_id: { type: String },
    transfer_id: { type: String },
    payout_reference: { type: String },
    date: { type: Date, default: Date.now },
    fanWalletTransactionId: { type: String },
    source: {
      type: String,
      enum: [
        'pie_distribution',
        'artist_payout',
        'manual_adjustment'
      ],
      required: true
    },
    metadata: {
      artist_name: { type: String },
      time_listened: { type: Number },
      total_tracks_listened: { type: Number },
      percentage: { type: String },
      total_artists_count: { type: Number },
      total_transactions_processed: { type: Number },
      fee_amount: { type: Number },
      net_amount: { type: Number },
      gross_amount: { type: Number },
      payout_breakdown: {
        gross: { type: Number },
        fee: { type: Number },
        net: { type: Number }
      }
    }
  },
  { timestamps: true }
);

ArtistWalletTransactionSchema.statics.findByArtistId = function (
  artistId: string
) {
  return this.find({ artistId }).sort({ date: -1 });
};

ArtistWalletTransactionSchema.statics.findByArtistWallet = function (
  artistWalletId: string
) {
  return this.find({ artistWalletId }).sort({ date: -1 });
};

ArtistWalletTransactionSchema.statics.findMoneyInByArtistId = function (
  artistId: string
) {
  return this.find({ artistId, transaction_type: 'money_in' }).sort({ date: -1 });
};

ArtistWalletTransactionSchema.statics.findMoneyOutByArtistId = function (
  artistId: string
) {
  return this.find({ artistId, transaction_type: 'money_out' }).sort({ date: -1 });
};

const ArtistWalletTransaction = mongoose.model<
  IArtistWalletTransaction,
  IArtistWalletTransactionModel
>('ArtistWalletTransaction', ArtistWalletTransactionSchema);

export default ArtistWalletTransaction;
