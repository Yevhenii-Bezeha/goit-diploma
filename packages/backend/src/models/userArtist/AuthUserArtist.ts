import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { Stripe } from 'stripe';
import logger from '../../utils/logger';
import User from '../userFan/User';

export enum OfficeType {
  ARTIST = 'Artist',
  LABEL = 'Label'
}

export enum ArtistRole {
  ARTIST = 'Artist',
  MANAGER = 'Manager'
}

export interface IUserArtist extends Document {
  _id: string;
  user_name: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  image_url: string;

  phone_number?: string;
  country?: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;
  country_of_incorporation?: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry;

  type?: OfficeType;
  role?: ArtistRole;

  google_id?: string;
  spotify_email?: string;
  spotify_user_name?: string;
  spotify_id?: string;
  twitter_id?: string;
  twitter_username?: string;
  twitter_access_token?: string;
  twitter_refresh_token?: string;
  instagram_id?: string;
  instagram_username?: string;
  instagram_access_token?: string;
  access_token?: string;
  refresh_token?: string;

  email_verified?: boolean;
  verification_token?: string;
  verification_token_expires?: Date;
  reset_password_token?: string;
  reset_password_expires?: Date;
  accepted_terms_and_conditions: boolean;
  auth_type: 'email' | 'spotify' | 'google' | 'twitter' | 'instagram';

  deleted_at?: Date;

  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AuthUserArtistSchema = new Schema<IUserArtist>(
  {
    email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return (
            !v || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)
          );
        },
        message: 'Please enter a valid email'
      }
    },
    spotify_email: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      select: false,
      validate: {
        validator: function (v: string) {
          return /^(?=.*[a-zA-Z])(?=.*\d)[^\s]{8,}$/.test(v);
        },
        message:
          'Password must be at least 8 characters long and contain at least one letter and one number'
      }
    },
    first_name: String,
    last_name: String,
    user_name: String,

    phone_number: {
      type: String,
      validate: {
        validator: function (v: string) {
          return !v || /^\+?[\d\s-]{10,}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    country: {
      type: String,
      trim: true
    },
    country_of_incorporation: String,

    type: {
      type: String,
      enum: Object.values(OfficeType),
      deprecated: true
    },
    role: {
      type: String,
      enum: Object.values(ArtistRole),
      deprecated: true
    },

    spotify_user_name: String,
    spotify_id: String,
    twitter_id: String,
    twitter_username: String,
    twitter_access_token: String,
    twitter_refresh_token: String,
    instagram_id: String,
    instagram_username: String,
    instagram_access_token: String,
    access_token: String,
    refresh_token: String,

    image_url: String,

    email_verified: {
      type: Boolean,
      default: false
    },
    verification_token: String,
    verification_token_expires: Date,
    reset_password_token: String,
    reset_password_expires: Date,

    accepted_terms_and_conditions: {
      type: Boolean,
      required: [true, 'You must accept the terms and conditions'],
      validate: {
        validator: function (v: boolean) {
          return v === true;
        },
        message: 'You must accept the terms and conditions'
      }
    },

    auth_type: {
      type: String,
      enum: ['email', 'spotify', 'google', 'twitter', 'instagram'],
      required: true,
      default: 'email'
    },

    google_id: {
      type: String,
      sparse: true,
      unique: true
    },

    deleted_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

AuthUserArtistSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    const password = this.get('password');
    if (password) {
      this.set('password', await bcrypt.hash(password, salt));
    }
    next();
  } catch (error) {
    next(error);
  }
});

AuthUserArtistSchema.pre('save', function (next) {
  const firstName = this.get('first_name');
  const lastName = this.get('last_name');

  if (firstName || lastName) {
    this.set('user_name', `${firstName || ''} ${lastName || ''}`.trim());
  }
  next();
});

AuthUserArtistSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    const user = await this.model('AuthUserArtist')
      .findById(this._id)
      .select('+password');
    if (!user || !user.password) return false;
    return await bcrypt.compare(candidatePassword, user.password);
  } catch (error) {
    logger.error('Error comparing passwords', {
      userId: this._id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw new Error('Error comparing passwords');
  }
};

const AuthUserArtist = model<IUserArtist>(
  'AuthUserArtist',
  AuthUserArtistSchema
);

AuthUserArtistSchema.post('save', async function (doc) {
  try {
    if (doc.password && doc.email) {
      const User = require('../userFan/User').default;
      await User.findOneAndUpdate(
        { email: doc.email },
        { $set: { password: doc.password } }
      );
    }
    if (doc.email_verified === true) {
      await User.updateOne(
        { email: doc.email },
        { $set: { email_verified: true } }
      );
    }
  } catch (err) {
    logger.error('Failed to sync password to User', {
      error: err,
      email: doc.email
    });
  }
});

export default AuthUserArtist;
