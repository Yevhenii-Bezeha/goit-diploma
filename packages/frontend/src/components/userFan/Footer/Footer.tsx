import { FooterIcons } from './FooterIcons.tsx';

export const Footer = () => {
  return (
    <footer className={'flex flex-col items-center justify-center pt-8 mb-4'}>
      <FooterIcons />
      <span className={'flex flex-col gap-1 mr-10'}></span>

      <div className="flex items-center justify-center gap-3 mt-3">
        <div className="flex items-center">
          <span className="w-1.5 h-1.5 bg-primary/80 rounded-full mr-1.5"></span>
          <span className="text-xs text-white/70">University Prototype</span>
        </div>
        <span className={'text-xs text-white/70'}>© {new Date().getFullYear()} Listener-Driven Micro-Donations</span>
      </div>
    </footer>
  );
};
