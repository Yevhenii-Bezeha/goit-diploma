import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { ReactNode, useRef, useEffect, useState } from 'react';
import classnames from 'classnames';
import Close from '../../../assets/icons/close.svg';
import { useUncontrolled } from '@mantine/hooks';
import ArrowLeft from '../../../assets/icons/arrowLeft.svg';

type ModalProps = {
  title?: string | ReactNode;
  className?: string;
  description?: string;
  openComponent?: string | ReactNode;
  children?: ReactNode;
  value?: boolean;
  onChange?: () => void;
  defaultValue?: boolean;
  onClose?: () => void;
  backdropClassName?: string;
  onBack?: (() => void) | undefined;
};

export const Modal = ({
  title,
  className,
  openComponent,
  description,
  children,
  value,
  defaultValue = false,
  onChange,
  onClose,
  backdropClassName,
  onBack,
}: ModalProps) => {
  const [isOpen, setIsOpen] = useUncontrolled({ value, onChange, defaultValue });
  const panelRef = useRef<HTMLDivElement>(null);
  const [allowClose, setAllowClose] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAllowClose(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleClose = () => {
    if (allowClose) {
      setIsOpen(false);
      setAllowClose(false);
      if (onClose) {
        onClose();
      }
    }
  };

  const forceClose = () => {
    setIsOpen(false);
    setAllowClose(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      <span className="w-full block" onClick={() => setIsOpen(true)}>{openComponent}</span>
      <Dialog open={isOpen} onClose={handleClose} className={'relative z-50'}>
        <div className="fixed inset-0 w-screen h-screen overflow-y-auto bg-[#322a3f]/60">
          <div className="min-h-full flex items-center justify-center p-2 mb-20">
            <DialogPanel ref={panelRef} className={classnames(
              'w-[95%] max-w-[90vw] lg:max-w-[720px] p-4 sm:p-5 md:p-6 lg:p-8 relative flex flex-col shadow-2xl rounded-2xl bg-[#120E16]',
              className
            )}>
              <div className="flex items-center justify-between mb-2 min-h-[32px]">
                {onBack ? (
                  <ArrowLeft
                    className="z-20 cursor-pointer hover:opacity-80 text-[#A78BFA]/50 fill-current"
                    width={28}
                    height={28}
                    onClick={onBack}
                  />
                ) : (
                  <span className="w-[28px] h-[28px]" />
                )}
                <div className="flex-1 flex justify-center items-center">
                  {title && <DialogTitle className="font-bold text-center">{title}</DialogTitle>}
                </div>
                <Close
                  className="z-20 cursor-pointer hover:opacity-80 text-[#A78BFA]/50 fill-current"
                  width={24}
                  height={24}
                  onClick={forceClose}
                />
              </div>
              {description && <Description>{description}</Description>}
              <div className="flex-1">
                {children}
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
};
