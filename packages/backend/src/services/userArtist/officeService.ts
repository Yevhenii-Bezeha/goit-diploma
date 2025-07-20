import { Types } from 'mongoose';
import AppError from '../../utils/AppError';
import Office, { IOffice, MemberRole } from '../../models/userArtist/Office';
import { OfficeType } from '../../models/userArtist/AuthUserArtist';
import { findUserArtistById } from './userArtist';
import logger from '../../utils/logger';

export const updateOfficeStripeDetails = async (
  officeId: string,
  stripeAccountId: string,
  accountStatus?: string
): Promise<IOffice | null> => {
  try {
    const updateData: {
      stripe_connect_account_id: string;
      stripe_connect_account_status?: string;
    } = {
      stripe_connect_account_id: stripeAccountId
    };

    if (accountStatus) {
      updateData.stripe_connect_account_status = accountStatus;
    }

    const updatedOffice = await Office.findByIdAndUpdate(
      officeId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedOffice) {
      logger.error('Office not found for Stripe account update', {
        officeId,
        stripeAccountId
      });
      return null;
    }

    return updatedOffice;
  } catch (error) {
    logger.error('Error updating office Stripe details', {
      officeId,
      stripeAccountId,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
};

export const isUserAdminOfOffice = async (
  userId: string,
  officeId: string
): Promise<boolean> => {
  const office = await Office.findOne({
    _id: new Types.ObjectId(officeId),
    members: {
      $elemMatch: {
        user_id: new Types.ObjectId(userId),
        role: MemberRole.ADMIN
      }
    }
  });

  return !!office;
};

/**
 * Create a new office
 */
export const createOffice = async (
  userId: string,
  name: string,
  type: OfficeType = OfficeType.ARTIST
): Promise<IOffice> => {
  const user = await findUserArtistById(userId);
  if (!user) {
    throw AppError.notFound('User not found');
  }

  const office = await Office.create({
    name,
    type,
    created_by: new Types.ObjectId(userId),
    members: [
      {
        user_id: new Types.ObjectId(userId),
        role: 'admin',
        added_at: new Date(),
        status: 'active'
      }
    ]
  });

  return office;
};

/**
 * Get all active offices for a user
 */
export const getUserOffices = async (userId: string): Promise<IOffice[]> => {
  const offices = await Office.find({
    members: {
      $elemMatch: {
        user_id: new Types.ObjectId(userId),
        status: 'active'
      }
    }
  });

  return offices;
};

/**
 * Get office by ID, throws if not found
 */
export const getOfficeById = async (officeId: string): Promise<IOffice> => {
  const office = await Office.findById(officeId);
  if (!office) {
    logger.warn('Office not found', { officeId });
    throw AppError.notFound('Office not found');
  }

  return office;
};

/**
 * Check if a user is a member of an office, throws if not found
 */
export const isUserMemberOfOffice = async (
  userId: string,
  officeId: string
): Promise<boolean> => {
  const office = await Office.findOne({
    _id: new Types.ObjectId(officeId),
    'members.user_id': new Types.ObjectId(userId)
  });

  return !!office;
};

/**
 * Create a default office for a user based on their current data
 * This is used during migration to create offices for existing users
 */
export const createDefaultOfficeForUser = async (
  userId: string,
  officeName?: string,
  type?: OfficeType
): Promise<IOffice | null> => {
  const existingOffices = await Office.find({
    'members.user_id': new Types.ObjectId(userId)
  }).limit(1);

  if (existingOffices.length > 0) {
    logger.info('User already has offices, skipping default office creation', {
      userId,
      existingOfficeId: existingOffices[0]._id
    });
    return existingOffices[0];
  }

  const user = await findUserArtistById(userId);
  if (!user) {
    logger.warn('User not found when creating default office', { userId });
    throw AppError.notFound('User not found');
  }

  if (
    !user.phone_number ||
    !user.country ||
    !user.first_name ||
    !user.last_name
  ) {
    logger.warn('Missing required user fields for office creation', { userId });
    return null;
  }

  const userWithFields = user as unknown as {
    type?: OfficeType;
    first_name: string;
  };

  const finalOfficeName = officeName || `${user.first_name}'s Office`;

  const finalType = type || userWithFields.type || OfficeType.ARTIST;

  try {
    const office = await createOffice(userId, finalOfficeName, finalType);
    logger.info('Successfully created default office for user', {
      userId,
      officeId: office._id,
      officeName: finalOfficeName,
      officeType: finalType
    });
    return office;
  } catch (error) {
    logger.error('Failed to create default office for user', {
      userId,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
};

/**
 * Find an office by its Stripe Connect account ID
 */
export const findOfficeByStripeAccountId = async (
  stripeAccountId: string
): Promise<IOffice | null> => {
  try {
    const office = await Office.findOne({
      stripe_connect_account_id: stripeAccountId
    });
    return office;
  } catch (error) {
    logger.error('Error finding office by Stripe account ID', {
      stripeAccountId,
      error: error instanceof Error ? error.message : String(error)
    });
    return null;
  }
};
