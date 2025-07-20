import { Schema, model, Document, Types } from 'mongoose';
import { OfficeType } from './AuthUserArtist';

export enum MemberRole {
  ADMIN = 'admin',
  MEMBER = 'member'
}

export enum MemberStatus {
  PENDING = 'pending',
  ACTIVE = 'active'
}

export interface OfficeMember {
  user_id: Types.ObjectId;
  role: MemberRole;
  added_at: Date;
  status?: MemberStatus;
  email?: string;
  invitation_token?: string;
  assigned_artists?: string[];
}

export interface IOffice extends Document {
  name: string;
  type: OfficeType;
  members: OfficeMember[];
  created_by: Types.ObjectId;
  stripe_connect_account_id?: string;
  stripe_connect_account_status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfficeMemberSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'AuthUserArtist',
    required: true
  },
  role: {
    type: String,
    enum: Object.values(MemberRole),
    default: MemberRole.MEMBER,
    required: true
  },
  added_at: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: Object.values(MemberStatus),
    required: true
  },
  email: {
    type: String
  },
  invitation_token: {
    type: String
  },
  assigned_artists: [
    {
      type: String,
      ref: 'Artist'
    }
  ]
});

const OfficeSchema = new Schema<IOffice>(
  {
    name: {
      type: String,
      required: [true, 'Office name is required'],
      trim: true,
      minlength: [2, 'Office name must be at least 2 characters long'],
      maxlength: [100, 'Office name cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: Object.values(OfficeType),
      required: true
    },
    members: [OfficeMemberSchema],
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'AuthUserArtist',
      required: true
    },
    stripe_connect_account_id: {
      type: String,
      sparse: true,
      unique: true
    },
    stripe_connect_account_status: {
      type: String,
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

const Office = model<IOffice>('Office', OfficeSchema);

export default Office;
