import React from 'react';
import { makeStyles } from '@mui/styles';
import Header from '../Header/Header';
import Menu from '../Menu/Menu';
import Footer from '../Footer/Footer';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  menu: {
    width: '250px',
  },
  content: {
    flex: 1,
    paddingLeft: '250px',
  },
  main: {
    marginTop: '64px',
    padding: theme.spacing(2),
  },
}));

const Layout = ({ children, onConfigOpen }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Menu className={classes.menu} />
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
