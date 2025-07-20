import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Footer } from '../Footer';

export const SharedLayout = () => {
  return (
    <div className={'bg-[#251E2F] flex flex-col justify-between min-h-[100vh]'}>
      <Header />
      <main className={'mb-auto min-h-0 flex flex-col flex-1 ml-auto mr-auto w-full lg:w-[960px] 2xl:w-[1280px] p-3 pt-20'}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
