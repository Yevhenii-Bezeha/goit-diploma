import { useFormikContext } from 'formik';
import { ArtistSearchResult } from '../../../../redux/userArtist/userArtistApi';
import { ArtistRow } from '../components/ArtistRow';
import { ClaimFormValues } from '../validation';
import { FormCheckbox } from '../../../shared/FormFields';
import { Button } from '../../../shared/Button';
import { NavLink } from 'react-router-dom';

type TermsStepProps = {
  selectedArtist: ArtistSearchResult;
  onSubmit: (values: Partial<ClaimFormValues>) => void;
  onPreviousStep: () => void;
};

export const TermsStep = ({ selectedArtist, onSubmit, onPreviousStep }: TermsStepProps) => {
  const { values } = useFormikContext<ClaimFormValues>();

  const canProceed = values.agreesToWaiver && values.agreesToFundsTerms && values.agreesToTerms;

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Terms & Conditions</h2>
        <p className="text-gray-400 text-sm">Please review and accept the terms</p>
      </div>

      <div className="flex-1">
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <ArtistRow artist={selectedArtist} />
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <FormCheckbox
                name="agreesToWaiver"
                className="bg-transparent"
                label={
                  <span className="text-sm text-gray-300 leading-relaxed">
                    I confirm that I am legally entitled to receive 100% of the funds sent to me, and that no part of these funds is subject to claims or revenue-sharing obligations under any current or prior contract.
                  </span>
                }
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <FormCheckbox
                name="agreesToFundsTerms"
                className="bg-transparent"
                label={
                  <span className="text-sm text-gray-300 leading-relaxed">
                    I acknowledge that I am solely responsible for redistributing funds to all other rightful contributors, and that these funds must not be withheld or redirected in violation of existing agreements.
                  </span>
                }
              />
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <FormCheckbox
                name="agreesToTerms"
                className="bg-transparent"
                label={
                  <span className="text-sm text-gray-300 leading-relaxed">
                    I accept the{' '}
                    <NavLink
                      to="/terms/artists"
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Terms and Conditions
                    </NavLink>{' '}
                    and{' '}
                    <NavLink
                      to="/privacy"
                      target="_blank"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Privacy Policy
                    </NavLink>
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-700">
        <Button
          onClick={onPreviousStep}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-md transition-colors"
        >
          Back
        </Button>
        <Button
          onClick={() => onSubmit(values)}
          disabled={!canProceed}
          className={`px-6 py-3 font-medium rounded-md transition-colors ${canProceed
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
        >
          Accept Terms
        </Button>
      </div>
    </div>
  );
};
