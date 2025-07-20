import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import logger from '../../utils/logger';

export interface LinkedAccount {
  provider: 'spotify';
  provider_id: string;
  provider_email?: string;
  provider_name?: string;
  access_token?: string;
  refresh_token?: string;
  connected_at: Date;
}

export interface IUser extends Document {
  _id: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  user_name?: string;
  image_url?: string;
  accepted_terms_and_conditions: boolean;
  email_verified?: boolean;
  verification_token?: string;
  verification_token_expires?: Date;
  reset_password_token?: string;
  reset_password_expires?: Date;
  auth_type: 'email' | 'spotify';
  stripe_customer_id: string;
  deleted_at?: Date;
  is_public: boolean;
  orphaned_money?: number;
  createdAt: Date;
  updatedAt: Date;
  is_service_account?: boolean;

  spotify_email?: string;
  spotify_user_name?: string;
  spotify_id?: string;
  last_successful_fetch_date?: number;
  expiry_date?: Date;

  linked_accounts: LinkedAccount[];

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema(
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

    spotify_user_name: String,
    spotify_id: String,

    user_name: String,
    last_successful_fetch_date: Number,
    expiry_date: Date,

    image_url: String,
    accepted_terms_and_conditions: {
      type: Boolean,
      required: [true, 'You must accept the terms and conditions']
    },
    stripe_customer_id: String,

    email_verified: {
      type: Boolean,
      default: false
    },
    verification_token: String,
    verification_token_expires: Date,
    reset_password_token: String,
    reset_password_expires: Date,

    auth_type: {
      type: String,
      enum: ['email', 'spotify'],
      required: true
    },

    deleted_at: {
      type: Date,
      default: null
    },

    is_public: {
      type: Boolean,
      default: true
    },

    orphaned_money: {
      type: Number,
      default: 0
    },

    is_service_account: {
      type: Boolean,
      default: false
    },

    linked_accounts: [{
      provider: {
        type: String,
        enum: ['spotify'],
        required: true
      },
      provider_id: {
        type: String,
        required: true
      },
      provider_email: String,
      provider_name: String,
      access_token: String,
      refresh_token: String,
      connected_at: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
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

UserSchema.pre('save', function (next) {
  if (this.first_name || this.last_name) {
    this.user_name = `${this.first_name || ''} ${this.last_name || ''}`.trim();
  }
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    const user = await this.model('User')
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

const User = model<IUser>('User', UserSchema);

export default User;
