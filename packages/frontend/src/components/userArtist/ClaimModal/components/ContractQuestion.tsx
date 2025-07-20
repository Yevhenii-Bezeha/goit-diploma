import { useField, useFormikContext } from 'formik';
import classnames from 'classnames';
import { ClaimFormInternalValues } from '../validation';

type ContractQuestionProps = {
  name: string;
};

export const ContractQuestion = ({ name }: ContractQuestionProps) => {
  const [field, meta, helpers] = useField<boolean | null>(name);
  const { setFieldValue } = useFormikContext<ClaimFormInternalValues>();
  const hasError = meta.touched && meta.error;

  const handleContractAnswer = (hasContracts: boolean) => {
    helpers.setValue(hasContracts);

    if (!hasContracts) {
      setFieldValue('agreesToWaiver', true);
    }
  };

  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600"></div>
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <p className="text-lg">
            StreamSupport exists to reconnect fans and artists. We believe 100% of fan contributions should go straight to the
            people making the music. That's why we only send funds to artists who confirm they're legally allowed to
            receive them in full.
          </p>

          <div className="mt-4">
            <p className="text-lg font-medium mb-3">
              Do you have any existing contracts that would prevent you from receiving 100% of the funds (such as label
              or distribution deals)?
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleContractAnswer(true)}
                className={classnames(
                  'px-6 py-2 rounded-lg border transition-colors',
                  field.value === true
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-gray-600 hover:border-violet-500'
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleContractAnswer(false)}
                className={classnames(
                  'px-6 py-2 rounded-lg border transition-colors',
                  field.value === false
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-gray-600 hover:border-violet-500'
                )}
              >
                No
              </button>
            </div>
          </div>

          {hasError && <p className="text-red-500 text-sm">{meta.error}</p>}
        </div>
      </div>
    </div>
  );
};
