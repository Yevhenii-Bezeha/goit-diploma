import * as Yup from 'yup';
import { ArtistSearchResult } from '../../../redux/userArtist/userArtistApi';

export type ClaimFormInternalValues = {
  searchTerm: string;
  selectedArtist: string | null;
  selectedArtistData: ArtistSearchResult | null;
  agreesToWaiver: boolean;
  agreesToFundsTerms: boolean;
  agreesToTerms: boolean;
  verificationMethod: 'link' | null;
  selectedPlatform: {
    id: string;
    name: string;
    url?: string;
  } | null;
  verificationString: string;
  officeId?: string | null;
};

export type ClaimFormValues = {
  selectedArtist: string;
  agreesToWaiver: boolean;
  agreesToFundsTerms: boolean;
  agreesToTerms: boolean;
  verificationMethod: 'link';
  platformName: string;
  verificationString: string;
  officeId?: string;
};

export const findArtistValidationSchema = Yup.object().shape({
  selectedArtist: Yup.string().nullable().required('Please select an artist'),
  selectedArtistData: Yup.mixed().nullable().required('Please select an artist'),
});

export const termsValidationSchema = Yup.object().shape({
  agreesToWaiver: Yup.boolean().oneOf([true], 'You must agree to the waiver'),
  agreesToFundsTerms: Yup.boolean().oneOf([true], 'You must agree to the funds terms'),
  agreesToTerms: Yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});

export const verificationValidationSchema = Yup.object().shape({
  verificationMethod: Yup.string().nullable().required('Please select a verification method'),
  selectedPlatform: Yup.object().nullable().required('Please select a platform'),
  verificationString: Yup.string().required('Verification string is required'),
});

export const getValidationSchema = (currentStep: number) => {
  const baseSchemas = {
    0: findArtistValidationSchema,
    1: termsValidationSchema,
    2: verificationValidationSchema,
  };

  return baseSchemas[currentStep as keyof typeof baseSchemas] || Yup.object().shape({});
};
