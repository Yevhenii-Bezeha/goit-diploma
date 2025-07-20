import BackIcon from '../../../assets/icons/arrowLeft.svg';
import classes from './BackButton.module.css';
import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
  const navigate = useNavigate();
  return <BackIcon onClick={() => navigate(-1)} width={48} height={48} className={classes.icon} />;
};
