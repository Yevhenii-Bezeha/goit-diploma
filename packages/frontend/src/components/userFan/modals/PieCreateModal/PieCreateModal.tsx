import { Modal } from '../../../shared/Modal';
import classnames from 'classnames';
import { useState } from 'react';
import { useCreateCheckoutSessionMutation, useGetUserQuery } from '../../../../redux/userFan';
import { useUncontrolled } from '@mantine/hooks';


type PieCreateModalProps = {
  className?: string;
  openButton?: React.ReactNode;
};

export const PieCreateModal = ({ className, openButton }: PieCreateModalProps) => {
  const [amount, setAmount] = useState(10);
  const [isOpen, setIsOpen] = useUncontrolled({ defaultValue: false });
  const [amountError, setAmountError] = useState<string>('');

  const [isRewardTopOnly, setIsRewardTopOnly] = useState(false);
  const [selectedTop, setSelectedTop] = useState<number>(50);

  const [createCheckoutSession, { isLoading: isCreatingPie }] = useCreateCheckoutSessionMutation();

  const handleRewardTopToggle = () => {
    setIsRewardTopOnly((prev) => {
      const newValue = !prev;
      if (newValue) {
        setSelectedTop(50);
      }
      return newValue;
    });
  };

  const handleTopChange = (value: number) => {
    setSelectedTop(value);
  };

  const handleAmountChange = (increment: boolean) => {
    setAmount((prev) => {
      const newAmount = increment ? prev + 1 : prev - 1;
      const result = Math.max(3, newAmount);
      setAmountError(result < 3 ? 'Minimum amount is $3' : '');
      return result;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setAmount(value);
    setAmountError(value < 3 ? 'Minimum amount is $3' : '');
  };

  const handleCreatePie = async () => {
    try {
      const response = await createCheckoutSession({
        amount: amount * 100,
        artistLimit: isRewardTopOnly ? selectedTop : 0,
        artistPopularity: 0,
        excludeNonActive: false,
      }).unwrap();

      const checkoutUrl = response.data.url;
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <Modal
      className={classnames(className)}
      openComponent={openButton}
      title={
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Create Micro-Donation</h2>
          <p className="text-[#A78BFA] text-sm">Set your monthly budget for artist support</p>
        </div>
      }
      value={isOpen}
      onChange={() => setIsOpen(!isOpen)}
    >
      <div className="flex flex-col gap-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <button
              disabled={amount <= 3}
              onClick={() => handleAmountChange(false)}
              className="w-12 h-12 rounded-full bg-[#8B5CF6] text-white hover:bg-[#A78BFA] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <div className="relative mx-6">
              <div className="w-32 h-32 rounded-full border-8 border-[#8B5CF6] flex items-center justify-center bg-[#1E152C]">
                <div className="flex flex-col items-center">
                  <input
                    type="number"
                    value={amount}
                    onChange={handleInputChange}
                    className="text-[#4ADE80] text-3xl font-bold w-16 bg-transparent text-center [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
                  />
                  <span className="text-[#A78BFA] text-sm mt-1">USD/month</span>
                </div>
              </div>
              {amountError && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-red-500 text-sm">
                  {amountError}
                </div>
              )}
            </div>
            <button
              onClick={() => handleAmountChange(true)}
              className="w-12 h-12 rounded-full bg-[#8B5CF6] text-white hover:bg-[#A78BFA] transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div className="bg-[#1E152C] p-4 rounded-lg border border-[#8B5CF6]/20">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="rewardTopOnly"
              checked={isRewardTopOnly}
              onChange={handleRewardTopToggle}
              className="w-4 h-4 text-[#8B5CF6] bg-transparent border-[#8B5CF6] rounded focus:ring-[#8B5CF6]"
            />
            <label htmlFor="rewardTopOnly" className="text-white font-medium">
              Limit to top artists only
            </label>
          </div>

          {isRewardTopOnly && (
            <div className="flex gap-2">
              {[10, 25, 50].map((top) => (
                <button
                  key={top}
                  onClick={() => handleTopChange(top)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${selectedTop === top
                    ? 'bg-[#8B5CF6] text-white'
                    : 'bg-[#23193A] text-[#A78BFA] hover:bg-[#8B5CF6]/20'
                    }`}
                >
                  Top {top}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1E152C] p-4 rounded-lg border border-[#8B5CF6]/20">
          <h3 className="text-white font-medium mb-2">How it works:</h3>
          <ul className="text-[#A78BFA] text-sm space-y-1">
            <li>• We track your Spotify listening</li>
            <li>• Distribute your budget to artists you listen to</li>
            <li>• Artists receive payments automatically</li>
            <li>• Renews monthly until cancelled</li>
          </ul>
        </div>

        <button
          onClick={handleCreatePie}
          disabled={amount < 3 || isCreatingPie}
          className="w-full py-3 bg-[#8B5CF6] hover:bg-[#A78BFA] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isCreatingPie ? (
            <div className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <span>Creating...</span>
            </div>
          ) : (
            'Create Micro-Donation'
          )}
        </button>
      </div>
    </Modal>
  );
};
