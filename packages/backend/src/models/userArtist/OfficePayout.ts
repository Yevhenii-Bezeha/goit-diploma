import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOfficePayout extends Document {
    _id: mongoose.Types.ObjectId;
    officeId: string;
    stripeConnectAccountId: string;
    transferId: string;
    payoutId?: string;
    payoutReference: string;

    status: 'pending' | 'in_progress' | 'completed' | 'failed';

    totalAmount: number;
    transferAmount: number;
    feeAmount: number;

    payoutAmount?: number;
    payoutCurrency?: string;
    payoutMethod?: string;

    transferCreatedAt: Date;
    payoutCreatedAt?: Date;
    payoutPaidAt?: Date;
    payoutFailedAt?: Date;

    artistBreakdown: Array<{
        artistId: string;
        artistName: string;
        amount: number;
        transactionIds: string[];
    }>;

    failureCode?: string;
    failureMessage?: string;

    stripeMetadata?: Record<string, string>;

    compensationApplied?: boolean;
}

interface IOfficePayoutModel extends Model<IOfficePayout> {
    findByOfficeId(officeId: string): Promise<IOfficePayout[]>;
    findByTransferId(transferId: string): Promise<IOfficePayout | null>;
    findByPayoutId(payoutId: string): Promise<IOfficePayout | null>;
    findPendingPayouts(officeId?: string): Promise<IOfficePayout[]>;
    findInProgressPayouts(officeId?: string): Promise<IOfficePayout[]>;
}

const OfficePayoutSchema = new Schema<IOfficePayout>(
    {
        officeId: {
            type: String,
            required: true
        },
        stripeConnectAccountId: {
            type: String,
            required: true
        },
        transferId: {
            type: String,
            required: true,
            unique: true
        },
        payoutId: {
            type: String
        },
        payoutReference: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'failed'],
            default: 'pending',
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        transferAmount: {
            type: Number,
            required: true
        },
        feeAmount: {
            type: Number,
            required: true
        },
        payoutAmount: {
            type: Number
        },
        payoutCurrency: {
            type: String
        },
        payoutMethod: {
            type: String
        },
        transferCreatedAt: {
            type: Date,
            required: true
        },
        payoutCreatedAt: {
            type: Date
        },
        payoutPaidAt: {
            type: Date
        },
        payoutFailedAt: {
            type: Date
        },
        artistBreakdown: [{
            artistId: {
                type: String,
                required: true
            },
            artistName: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            transactionIds: [{
                type: String,
                required: true
            }]
        }],
        failureCode: {
            type: String
        },
        failureMessage: {
            type: String
        },
        stripeMetadata: {
            type: Schema.Types.Mixed
        },
        compensationApplied: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

OfficePayoutSchema.statics.findByOfficeId = function (officeId: string) {
    return this.find({ officeId }).sort({ createdAt: -1 });
};

OfficePayoutSchema.statics.findByTransferId = function (transferId: string) {
    return this.findOne({ transferId });
};

OfficePayoutSchema.statics.findByPayoutId = function (payoutId: string) {
    return this.findOne({ payoutId });
};

OfficePayoutSchema.statics.findPendingPayouts = function (officeId?: string) {
    const query: any = { status: 'pending' };
    if (officeId) {
        query.officeId = officeId;
    }
    return this.find(query).sort({ createdAt: -1 });
};

OfficePayoutSchema.statics.findInProgressPayouts = function (officeId?: string) {
    const query: any = { status: 'in_progress' };
    if (officeId) {
        query.officeId = officeId;
    }
    return this.find(query).sort({ createdAt: -1 });
};

const OfficePayout = mongoose.model<IOfficePayout, IOfficePayoutModel>(
    'OfficePayout',
    OfficePayoutSchema
);

export default OfficePayout; 