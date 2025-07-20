import { Schema, model, Document } from 'mongoose';

export interface IBannedArtist extends Document {
  user_id: string;
  artist_id: string;
  reason?: string;
  banned_at: Date;
}

const BannedArtistSchema = new Schema<IBannedArtist>(
  {
    user_id: { type: String, ref: 'User', required: true },
    artist_id: { type: String, ref: 'Artist', required: true },
    reason: { type: String },
    banned_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const BannedArtist = model<IBannedArtist>('BannedArtist', BannedArtistSchema);

export default BannedArtist;
