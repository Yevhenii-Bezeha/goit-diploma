import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import classNames from 'classnames';

type TabsProps = {
  tabs: string[];
  className?: string;
  children?: React.ReactNode[];
  defaultIndex?: number;
  selectedIndex?: number;
  onChange?: (index: number) => void;
};

export const Tabs = ({ tabs, children, className, defaultIndex = 0, selectedIndex, onChange }: TabsProps) => {
  return (
    <div className={classNames('w-full', className)}>
      <TabGroup defaultIndex={defaultIndex} selectedIndex={selectedIndex} onChange={onChange}>
        <TabList className="flex space-x-2 bg-[#1A1420] rounded-b-2xl">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  'w-full py-4 text-sm font-medium leading-5 transition-all duration-200 relative',
                  'focus:outline-none',
                  selected
                    ? 'bg-[#120E16] text-white after:absolute after:top-0 after:left-0 after:w-full after:h-0.5 after:bg-primary rounded-b-2xl'
                    : 'text-[#808191] hover:text-white hover:bg-[#120E16]/60 hover:after:absolute hover:after:top-0 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-primary/50'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </TabList>
        <TabPanels className="mt-0">
          {children?.map((child, idx) => (
            <TabPanel key={tabs[idx]} className="focus:outline-none">
              {child}
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  );
};
