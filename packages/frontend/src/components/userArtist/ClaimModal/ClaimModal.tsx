import { Modal } from '../../shared/Modal';
import { useSearchArtistsQuery, useGetUserArtistQuery } from '../../../redux/userArtist/userArtistApi';
import { useClaimFlow } from './hooks/useClaimFlow';
import { ClaimForm } from './components/ClaimForm';
import { ReactNode } from 'react';

type ClaimModalProps = {
  visible?: boolean;
  onChange?: () => void;
  openComponent?: ReactNode;
};

export const ClaimModal = ({ visible, onChange, openComponent }: ClaimModalProps) => {
  const {
    currentStep,
    queryTerm,
    currentPage,
    initialValues,
    isSubmitting,
    errorMessage,
    createdClaimId,
    handleClose,
    handleSearch,
    handlePageChange,
    handleNextStep,
    handlePreviousStep,
    handleSubmit,
    clearVerificationMethod,
    formResetKey,
  } = useClaimFlow(onChange);

  const { data: searchResponse, isFetching } = useSearchArtistsQuery(
    { searchTerm: queryTerm, page: currentPage },
    {
      skip: !queryTerm,
    }
  );

  useGetUserArtistQuery(undefined, {
    skip: !visible,
  });

  const handleBackArrow = () => {
    if (
      currentStep === 2 &&
      initialValues.verificationMethod
    ) {
      clearVerificationMethod();
    } else {
      handlePreviousStep();
    }
  };

  return (
    <Modal
      value={visible}
      onChange={handleClose}
      className="!bg-gray-900 shadow-2xl rounded-lg border border-gray-700"
      backdropClassName="bg-black/60"
      openComponent={openComponent}
      onBack={currentStep > 0 && currentStep < 3 ? handleBackArrow : undefined}
    >
      <ClaimForm
        currentStep={currentStep}
        initialValues={initialValues}
        searchResults={searchResponse?.data}
        totalPages={searchResponse?.pagination?.pages || 1}
        currentPage={searchResponse?.pagination?.page || 1}
        isFetching={isFetching}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        createdClaimId={createdClaimId}
        onSearch={handleSearch}
        onPageChange={handlePageChange}
        onClose={handleClose}
        onNextStep={handleNextStep}
        onPreviousStep={handlePreviousStep}
        onSubmit={handleSubmit}
        onClearVerificationMethod={clearVerificationMethod}
        formResetKey={formResetKey}
      />
    </Modal>
  );
};
