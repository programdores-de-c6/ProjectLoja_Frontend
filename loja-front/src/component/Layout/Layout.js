import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import Header from '../Header/Header';
//import Menu from '../Menu/Menu';
import Footer from '../Footer/Footer';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  menu: {
    width: '0px',
  },
  content: {
    flex: 1,
    paddingLeft: '-8px',
  },
  main: {
    marginTop: '0px',
    padding: theme.spacing(2),
  },
}));

const Layout = ({ children, onConfigOpen }) => {
  const classes = useStyles();
  const [isMenuCollapsed, setIsMenuCollapsed] = useState(false);

  const toggleMenu = () => {
    setIsMenuCollapsed(!isMenuCollapsed);
  };

  return (
    <div className={classes.root}>
      <div className={classes.content}>
        <Header onConfigOpen={onConfigOpen} />
        <div className={classes.main}>
          {children}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
