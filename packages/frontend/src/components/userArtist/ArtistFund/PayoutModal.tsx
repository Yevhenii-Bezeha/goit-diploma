import { Modal } from '../../shared/Modal/Modal';
import { useCreatePayoutMutation } from '../../../redux/userArtist';
import { useSelector } from 'react-redux';
import { isUserOfficeAdminSelector } from '../../../redux/userArtist/userArtistSlice';
import { useState } from 'react';

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: number;
  officeId: string;
  artistBreakdown?: Array<{
    artistId: string;
    artistName: string;
    availableAmount: number;
    inPayoutAmount: number;
    paidOutAmount: number;
    transactionCount: number;
  }>;
}

// Simple USD formatting function
const formatUSD = (amount: number) => `$${(amount / 100).toFixed(2)}`;

export const PayoutModal = ({ isOpen, onClose, maxAmount, officeId, artistBreakdown = [] }: PayoutModalProps) => {
  const [createPayout, { isLoading }] = useCreatePayoutMutation();
  const isAdmin = useSelector(isUserOfficeAdminSelector);

  // Simplified success state
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePayout = async () => {
    try {
      if (maxAmount < 300) {
        alert(`Minimum payout amount is $3.00`);
        return;
      }

      await createPayout({
        officeId,
      }).unwrap();

      setShowSuccess(true);
    } catch (error: any) {
      console.error('Failed to create payout:', error);
      const errorMsg = error.data?.message || error.message || 'Unknown error occurred';
      alert(`Payout failed: ${errorMsg}`);
    }
  };

  const isValidPayout = maxAmount >= 300;

  // Simplified success modal
  if (showSuccess) {
    return (
      <Modal value={isOpen} onChange={onClose} title="Success">
        <div className="p-6 max-w-sm mx-auto text-center">
          <div className="text-green-400 text-4xl mb-4">✓</div>
          <div className="text-white font-medium mb-2">Payout Sent!</div>
          <div className="text-gray-400 text-sm mb-6">
            Funds will arrive in your bank account within 2-3 business days.
          </div>
          <button
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
            onClick={() => {
              setShowSuccess(false);
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal value={isOpen} onChange={onClose} title="Request Payout">
      <div className="p-6 max-w-sm mx-auto">
        {/* Simplified amount display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-green-500 mb-1">{formatUSD(maxAmount)}</div>
          <div className="text-gray-400 text-sm">Available for payout</div>
        </div>

        {/* Minimal info */}
        <div className="text-gray-400 text-sm text-center mb-6">
          Monthly fee: $2.00 • Payout fee: 0.3%
        </div>

        {/* Simple artist count */}
        {artistBreakdown.length > 0 && (
          <div className="text-center mb-6">
            <div className="text-white text-sm">
              {artistBreakdown.length} artist{artistBreakdown.length !== 1 ? 's' : ''} will receive funds
            </div>
          </div>
        )}

        {/* Simplified action buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePayout}
            disabled={!isValidPayout || isLoading || !isAdmin}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Request Payout'}
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PayoutModal;
