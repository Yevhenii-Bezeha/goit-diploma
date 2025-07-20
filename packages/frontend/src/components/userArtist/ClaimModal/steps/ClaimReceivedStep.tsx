import { Button } from '../../../shared/Button';
import {
  useCreateStripeOnboardingLinkMutation,
  useCreateStripeLoginLinkQuery,
} from '../../../../redux/userArtist/userArtistApi';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';

export const ClaimReceivedStep = ({ onClose }: { onClose: () => void }) => {
  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice);
  const officeId = selectedOffice?._id || '';

  const [createStripeOnboardingLink] = useCreateStripeOnboardingLinkMutation();
  const {
    data: loginData,
    isLoading: loginLinkLoading,
    refetch: refetchLoginLink,
  } = useCreateStripeLoginLinkQuery(
    { officeId },
    {
      skip:
        !officeId ||
        !selectedOffice?.stripe_connect_account_id ||
        selectedOffice?.stripe_connect_account_status !== 'complete',
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleStripeSetup = async () => {
    if (!officeId) {
      console.error('No office selected');
      return;
    }

    setIsLoading(true);
    try {
      if (selectedOffice?.stripe_connect_account_status === 'complete') {
        if (loginData?.url) {
          window.open(loginData.url, '_blank');
        } else {
          const result = await refetchLoginLink().unwrap();
          if (result?.url) {
            window.open(result.url, '_blank');
          } else {
            console.error('No Stripe login URL available after refetch');
          }
        }
      } else {
        const { url } = await createStripeOnboardingLink({ officeId }).unwrap();
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Failed to create Stripe link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showStripeSetup = !selectedOffice || selectedOffice.stripe_connect_account_status !== 'complete';

  const getStripeMessage = () => {
    switch (selectedOffice?.stripe_connect_account_status) {
      case 'pending':
        return 'Your payment account is pending verification.';
      case 'requires_information':
        return 'Additional information is required for your payment account to receive payments.';
      case 'pending_verification':
        return 'Your payment account is being verified.';
      default:
        return 'To receive payments from fans, please set up your payment account.';
    }
  };

  const getVerificationMessage = () => {
    return 'We will need 3 to 5 days to manually verify your account and will notify you via email when your account is ready. In the meantime you can access or cancel your claim from the Artists list screen.';
  };

  if (!selectedOffice) {
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-2xl w-full border border-gray-700">
          <h2 className="text-3xl font-semibold text-white mb-4">Claim Received</h2>
          <p className="text-red-400 mb-6">
            Please select an office from the sidebar to set up your payment account.
          </p>
          <Button
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-8 text-center max-w-2xl w-full border border-gray-700">
        <h2 className="text-3xl font-semibold text-white mb-4">Claim Received</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          {getVerificationMessage()}
        </p>
        <Button
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
};
