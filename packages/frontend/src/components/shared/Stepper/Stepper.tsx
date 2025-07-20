import { Fragment } from 'react';
import classnames from 'classnames';

type StepperProps = {
  currentStep: number;
  numberOfSteps: number;
  className?: string;
};

export const Stepper = ({ currentStep, numberOfSteps, className }: StepperProps) => {
  const activeColor = (index: number) => (currentStep >= index ? 'bg-violet-500' : 'bg-greyText');
  const isFinalStep = (index: number) => index === numberOfSteps - 1;

  return (
    <div className={classnames('flex items-center mx-auto', className)}>
      {Array.from({ length: numberOfSteps }).map((_, index) => (
        <Fragment key={index}>
          <div className={`w-4 h-4 rounded-full border border-gray-600 ${activeColor(index)}`}></div>
          {isFinalStep(index) ? null : <div className={`w-24 h-1 ${activeColor(index + 1)}`}></div>}
        </Fragment>
      ))}
    </div>
  );
};
