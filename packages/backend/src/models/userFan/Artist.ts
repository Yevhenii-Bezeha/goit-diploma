import { Schema, model, Document } from 'mongoose';

export interface IArtist extends Document {
  _id: string;
  image?: string;
  name: string;
  is_banned?: boolean;
  external_url: string;
  popularity?: number;
  active?: boolean;
  mbid?: string;
  social_networks?: string[];
  mb_image?: string;
  musicbrainz_checked?: boolean;
}

const ArtistSchema = new Schema<IArtist>(
  {
    _id: String,
    image: String,
    name: { type: String },
    is_banned: Boolean,
    external_url: String,
    popularity: { type: Number },
    active: { type: Boolean, default: true },
    mbid: String,
    social_networks: [String],
    mb_image: String,
    musicbrainz_checked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Artist = model<IArtist>('Artist', ArtistSchema);

export default Artist;
