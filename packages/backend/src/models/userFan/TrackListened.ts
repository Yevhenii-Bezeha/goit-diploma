import { Schema, model, Document, Types } from 'mongoose';

export interface ITrackListened extends Document {
  _id: Types.ObjectId;
  spotify_id: string;
  image: string;
  artists: string[];
  artist_count: number;
  duration: number;
  name: string;
  user_id: string;
  played_at: Date;
  popularity: number;
  pie_id?: Types.ObjectId;
  external_url: string;
  album_name: string;
  album_id: string;
}

const TrackListenedSchema = new Schema<ITrackListened>(
  {
    _id: Schema.Types.ObjectId,
    spotify_id: String,
    album_id: String,
    album_name: String,
    image: String,
    artists: [String],
    artist_count: Number,
    duration: Number,
    name: String,
    user_id: { type: String, ref: 'User' },
    played_at: { type: Date },
    popularity: { type: Number },
    pie_id: { type: Schema.Types.ObjectId, ref: 'Pie', required: false },
    external_url: String
  },
  { timestamps: true }
);

const TrackListened = model<ITrackListened>(
  'TrackListened',
  TrackListenedSchema
);

export default TrackListened;
