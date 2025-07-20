import { Schema, model } from 'mongoose';

const PieSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    start_date: {
      type: Date,
      get: (v: Date) => v?.toISOString(),
      set: (v: string | Date) => (typeof v === 'string' ? new Date(v) : v)
    },
    end_date: {
      type: Date,
      get: (v: Date) => v?.toISOString(),
      set: (v: string | Date) => (typeof v === 'string' ? new Date(v) : v)
    },
    user_id: { type: String, ref: 'User' },
    is_test: Boolean,
    is_active: { type: Boolean },
    is_recurring: Boolean,
    is_completed: { type: Boolean, default: false },
    amount: { type: Number },
    is_paid: { type: Boolean, default: false },
    transfer_group_id: String,
    subscriptionId: String,
    stripe_charge_id: String,
    artistLimit: { type: Number, default: 0 },
    artistPopularity: { type: Number, default: 0 },
    excludeNonActive: { type: Boolean, default: false },
    total_time_listened: { type: Number, default: 0 },
    manual_artist_settings: [
      {
        artist_id: { type: String, required: true },
        inclusion_status: {
          type: String,
          enum: ['DEFAULT', 'INCLUDED', 'EXCLUDED'],
          default: 'DEFAULT'
        }
      }
    ],
    is_trialing: { type: Boolean, default: false },
    cancelled_by_user: { type: Boolean, default: false },
    creation_state: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    creation_metadata: {
      initiated_at: Date,
      completed_at: Date,
      last_updated: Date,
      subscription_status: String,
      charge_id: String,
      error_message: String
    },
    snapshot: {
      type: {
        stats: {
          count_tracks: Number,
          count_artists: Number,
          total_time_listened: String
        },
        included_artists: [
          {
            artist_id: String,
            artist_name: String,
            artist_external_url: String,
            artist_image: String,
            total_time_listened: String,
            total_tracks_listened: Number,
            popularity: Number,
            money: String,
            money_after_fees: String,
            percentage: String,
            is_claimed: Boolean,
            claim_info: {
              claiming_user_id: String,
              claim_id: String,
              stripe_connect_account_id: String
            },
            payment_status: {
              status: {
                type: String,
                enum: ['transferred', 'escrowed', 'failed']
              },
              transfer_id: String,
              escrow_id: String
            }
          }
        ],
        excluded_artists: [
          {
            artist_id: String,
            artist_name: String,
            artist_external_url: String,
            artist_image: String,
            total_time_listened: String,
            total_tracks_listened: Number,
            popularity: Number,
            reasons: [String]
          }
        ],
        wallet_transfer: {
          amount: Number,
          reason: String,
          timestamp: Date
        }
      },
      required: false
    }
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  }
);

PieSchema.pre('save', function (next) {
  if (this.isModified('start_date') && typeof this.start_date === 'string') {
    this.start_date = new Date(this.start_date);
  }
  if (this.isModified('end_date') && typeof this.end_date === 'string') {
    this.end_date = new Date(this.end_date);
  }
  next();
});

const Pie = model('Pie', PieSchema);

export default Pie;
