import { Switch } from '@headlessui/react';

type ToggleProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
};

export const Toggle = ({ checked, onChange }: ToggleProps) => {
  const handleChange = (checked: boolean) => {
    onChange?.(checked);
  };

  return (
    <Switch
      checked={checked}
      onChange={handleChange}
      className="group inline-flex h-5 w-10 min-w-[40px] items-center rounded-full bg-gray-200 transition data-[checked]:bg-[#8B5CF6]"
    >
      <span className="size-3 translate-x-1 rounded-full bg-black transition group-data-[checked]:translate-x-6" />
    </Switch>
  );
};
