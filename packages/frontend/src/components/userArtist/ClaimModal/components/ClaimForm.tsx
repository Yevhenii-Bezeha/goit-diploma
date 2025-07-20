import { Form, Formik } from 'formik';
import { Stepper } from '../../../shared/Stepper';
import { FindArtistStep } from '../steps/FindArtistStep';
import { TermsStep } from '../steps/TermsStep';
import { VerificationStep } from '../steps/VerificationStep';
import { ClaimReceivedStep } from '../steps/ClaimReceivedStep';
import { ClaimFormInternalValues, getValidationSchema } from '../validation';
import { ArtistSearchResult, useGetUserArtistQuery } from '../../../../redux/userArtist/userArtistApi';

type ClaimFormProps = {
  currentStep: number;
  initialValues: ClaimFormInternalValues;
  searchResults: ArtistSearchResult[] | undefined;
  totalPages: number;
  currentPage: number;
  isFetching: boolean;
  isSubmitting: boolean;
  errorMessage: string | null;
  createdClaimId?: string | null;
  onSearch: (searchTerm: string) => void;
  onPageChange: (page: number) => void;
  onClose: () => void;
  onNextStep: () => void;
  onPreviousStep: () => void;
  onSubmit: (values: ClaimFormInternalValues) => Promise<void>;
  onClearVerificationMethod?: () => void;
  formResetKey?: number;
};

export const ClaimForm = ({
  currentStep,
  initialValues,
  searchResults,
  totalPages,
  currentPage,
  isFetching,
  isSubmitting,
  errorMessage,
  createdClaimId,
  onSearch,
  onPageChange,
  onClose,
  onNextStep,
  onPreviousStep,
  onSubmit,
  onClearVerificationMethod,
  formResetKey,
}: ClaimFormProps) => {
  const { data: { email } = {} } = useGetUserArtistQuery();

  const renderStep = (values: ClaimFormInternalValues) => {
    if (currentStep > 0 && !values.selectedArtistData) {
      return (
        <FindArtistStep
          searchResults={searchResults}
          totalPages={totalPages}
          currentPage={currentPage}
          isFetching={isFetching}
          onSearch={onSearch}
          onPageChange={onPageChange}
          onSubmit={onNextStep}
          onPreviousStep={onPreviousStep}
          currentStep={currentStep}
        />
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <FindArtistStep
            searchResults={searchResults}
            totalPages={totalPages}
            currentPage={currentPage}
            isFetching={isFetching}
            onSearch={onSearch}
            onPageChange={onPageChange}
            onSubmit={onNextStep}
            onPreviousStep={onPreviousStep}
            currentStep={currentStep}
          />
        );
      case 1:
        return values.selectedArtistData ? (
          <TermsStep selectedArtist={values.selectedArtistData} onSubmit={onNextStep} onPreviousStep={onPreviousStep} />
        ) : null;
      case 2:
        return values.selectedArtistData ? (
          <VerificationStep
            selectedArtist={values.selectedArtistData}
            email={email!}
            isSubmitting={isSubmitting}
            onVerificationComplete={() => onSubmit(values)}
            onPreviousStep={onPreviousStep}
            onClose={onClose}
            onClearVerificationMethod={onClearVerificationMethod}
            createdClaimId={createdClaimId}
          />
        ) : null;
      case 3:
        return <ClaimReceivedStep onClose={onClose} />;
      default:
        return null;
    }
  };

  return (
    <Formik
      key={formResetKey}
      initialValues={initialValues}
      validationSchema={getValidationSchema(currentStep)}
      onSubmit={onSubmit}
      validateOnMount={false}
      validateOnChange={false}
      validateOnBlur={true}
      enableReinitialize={true}
    >
      {({ values }) => (
        <Form className="flex flex-col w-full p-6">
          {errorMessage && (
            <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 mb-6 rounded-md">
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          <div className="flex flex-col">
            {currentStep < 3 && (
              <div className="mb-6">
                <Stepper currentStep={currentStep} numberOfSteps={3} className="pt-2 pb-4" />
              </div>
            )}
            {renderStep(values)}
          </div>
        </Form>
      )}
    </Formik>
  );
};
