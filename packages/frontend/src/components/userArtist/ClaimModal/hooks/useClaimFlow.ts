import { useState } from 'react';
import { ClaimFormValues, ClaimFormInternalValues } from '../validation';
import { useCreateClaimMutation } from '../../../../redux/userArtist/userArtistApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { trackBusinessEvent, BusinessEvents } from '../../../../utils/analytics';

const initialValues: ClaimFormInternalValues = {
  searchTerm: '',
  selectedArtist: null,
  selectedArtistData: null,
  agreesToWaiver: false,
  agreesToFundsTerms: false,
  agreesToTerms: false,
  verificationMethod: null,
  selectedPlatform: null,
  verificationString: '',
  officeId: null,
};

export const useClaimFlow = (onChange?: () => void) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [queryTerm, setQueryTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formValues, setFormValues] = useState<ClaimFormInternalValues>(initialValues);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdClaimId, setCreatedClaimId] = useState<string | null>(null);
  const [createClaim] = useCreateClaimMutation();
  const selectedOffice = useSelector((state: RootState) => state.userArtist.selectedOffice);
  const [formResetKey, setFormResetKey] = useState(0);

  const handleClose = () => {
    setCurrentStep(0);
    setQueryTerm('');
    setCurrentPage(1);
    setFormValues(initialValues);
    setErrorMessage(null);
    setCreatedClaimId(null);
    onChange?.();
  };

  const handleSearch = (searchTerm: string) => {
    if (searchTerm.trim()) {
      if (searchTerm.trim() !== queryTerm) {
        setCurrentPage(1);
      }
      setQueryTerm(searchTerm);
    } else {
      setQueryTerm('');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => prev + 1);
  };

  const handlePreviousStep = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (values: ClaimFormInternalValues) => {
    if (isSubmitting) return;

    // Guard: Ensure selectedPlatform is not null
    if (!values.selectedPlatform) {
      setErrorMessage('Please select a platform before continuing.');
      setIsSubmitting(false);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setFormValues(values);

      // Track the verification method chosen
      trackBusinessEvent(BusinessEvents.ARTIST_CLAIMED, {
        verification_method: values.verificationMethod,
      });

      // For manual verification, create a claim through API
      const submissionValues: ClaimFormValues = {
        selectedArtist: values.selectedArtist!,
        agreesToWaiver: values.agreesToWaiver,
        agreesToFundsTerms: values.agreesToFundsTerms,
        agreesToTerms: values.agreesToTerms,
        verificationMethod: 'link', // Always manual verification
        platformName: values.selectedPlatform!.name,
        verificationString: values.verificationString,
      };

      // Use the selected office ID from Redux instead of the form value
      if (selectedOffice?._id) {
        submissionValues.officeId = selectedOffice._id;
      }

      const result = await createClaim(submissionValues).unwrap();
      // Store the created claim ID
      if (result && result.data && result.data._id) {
        setCreatedClaimId(result.data._id);
      }
      handleNextStep();
    } catch (error) {
      console.error('Error creating claim:', error);
      let errorMsg =
        error instanceof Error
          ? error.message
          : (error as any)?.data?.message || 'Failed to create claim. Please try again.';
      // User-friendly override for known backend error
      if (
        errorMsg === 'You or your office already has a pending claim for this artist' ||
        (error as any)?.data?.code === 'BAD_REQUEST'
      ) {
        errorMsg =
          'You already have a pending claim for this artist. Please wait for it to be processed before submitting another.';
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearVerificationMethod = () => {
    setFormValues((prev) => {
      const newValues = {
        ...prev,
        verificationMethod: null,
        selectedPlatform: null,
      };
      return { ...newValues }; // ensure new object reference
    });
    setFormResetKey((k) => k + 1);
  };

  return {
    currentStep,
    queryTerm,
    currentPage,
    initialValues: formValues,
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
  };
};
