import ResponsivePagination from 'react-responsive-pagination';
import 'react-responsive-pagination/themes/classic.css';
import classnames from 'classnames';
import classes from './Pagination.module.css';

type PaginationType = {
  currentPage: number;
  totalCount: number;
  onChange: (v: number) => void;
  width?: string;
  className?: string;
};

export const Pagination = ({
  currentPage,
  totalCount,
  onChange,
  width = 'w-[80%] md:w-[30%]',
  className = '',
}: PaginationType) => {
  return (
    <div className={classnames(`mt-4 ${width} mx-auto`, classes.container, className)}>
      <ResponsivePagination current={currentPage} total={totalCount} onPageChange={onChange} />
    </div>
  );
};
