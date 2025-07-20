import mongoose, { Schema, Document } from 'mongoose';

export interface IArtistWallet extends Document {
  _id: mongoose.Types.ObjectId;
  artistId: string;
}

const ArtistWalletSchema = new Schema<IArtistWallet>(
  {
    artistId: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

const ArtistWallet = mongoose.model<IArtistWallet>(
  'ArtistWallet',
  ArtistWalletSchema
);

export default ArtistWallet;
