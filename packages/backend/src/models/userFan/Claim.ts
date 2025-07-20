import { Schema, model } from 'mongoose';
import logger from '../../utils/logger';

const ClaimSchema = new Schema(
  {
    claiming_user_id: { type: String, ref: 'AuthUserArtist' },
    office_id: {
      type: Schema.Types.ObjectId,
      ref: 'Office'
    },
    artist_id: {
      type: String,
      ref: 'Artist'
    },
    status: {
      type: String,
      enum: ['Pending', 'Successful', 'Rejected', 'Deleted'],
      default: 'Pending'
    },
    agreesToWaiver: {
      type: Boolean,
      required: true
    },
    agreesToFundsTerms: {
      type: Boolean,
      required: true
    },
    agreesToTerms: {
      type: Boolean,
      required: true
    },
    verificationMethod: {
      type: String,
      enum: ['message', 'link', 'twitter', 'youtube', 'instagram', 'facebook'],
      required: true
    },
    platformName: {
      type: String,
      required: true
    },
    verificationString: {
      type: String,
      required: true
    },
    spotifyVerified: {
      type: Boolean,
      default: false
    },
    verificationAttempts: [
      {
        method: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'failed'], required: true },
        checkedAt: { type: Date },
        result: {
          found: { type: Boolean },
          checkedText: { type: String },
          mypieLink: { type: String },
        },
        email: {
          scheduledAt: { type: Date },
          sentAt: { type: Date },
          type: { type: String, enum: ['approved', 'failed'] }
        }
      }
    ]
  },
  { timestamps: true }
);



const Claim = model('Claim', ClaimSchema);

export default Claim;
