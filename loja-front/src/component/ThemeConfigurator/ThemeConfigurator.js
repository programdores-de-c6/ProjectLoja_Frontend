import React from 'react';
import { makeStyles } from '@mui/styles';
import Drawer from '@mui/material/Drawer';
import { SketchPicker } from 'react-color';
import { Typography, Divider } from '@mui/material';

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 300,
    padding: theme.spacing(2),
  },
  colorPicker: {
    marginBottom: theme.spacing(2),
  },
  section: {
    marginBottom: theme.spacing(2),
  },
}));

const ThemeConfigurator = ({ open, onClose }) => {
  const classes = useStyles();
  const [menuColor, setMenuColor] = React.useState('#ffffff');
  const [footerColor, setFooterColor] = React.useState('#ffffff');
  const [footerTextColor, setFooterTextColor] = React.useState('#333333');
  const [headerColor, setHeaderColor] = React.useState('#ffffff');

  const handleMenuColorChange = (color) => {
    setMenuColor(color.hex);
    document.documentElement.style.setProperty('--menu-bg-color', color.hex);
  };

  const handleFooterColorChange = (color) => {
    setFooterColor(color.hex);
    document.documentElement.style.setProperty('--footer-bg-color', color.hex);
  };

  const handleFooterTextColorChange = (color) => {
    setFooterTextColor(color.hex);
    document.documentElement.style.setProperty('--footer-text-color', color.hex);
  };

  const handleHeaderColorChange = (color) => {
    setHeaderColor(color.hex);
    document.documentElement.style.setProperty('--header-bg-color', color.hex);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.drawer}>
        <div className={classes.section}>
          <Typography variant="subtitle1" gutterBottom>
            Cor do Menu
          </Typography>
          <div className={classes.colorPicker}>
            <SketchPicker color={menuColor} onChangeComplete={handleMenuColorChange} />
          </div>
        </div>
        <Divider />
        <div className={classes.section}>
          <Typography variant="subtitle1" gutterBottom>
            Cor do Rodapé
          </Typography>
          <div className={classes.colorPicker}>
            <SketchPicker color={footerColor} onChangeComplete={handleFooterColorChange} />
          </div>
          <Typography variant="subtitle1" gutterBottom>
            Cor do Texto do Rodapé
          </Typography>
          <div className={classes.colorPicker}>
            <SketchPicker color={footerTextColor} onChangeComplete={handleFooterTextColorChange} />
          </div>
        </div>
        <Divider />
        <div className={classes.section}>
          <Typography variant="subtitle1" gutterBottom>
            Cor do Cabeçalho
          </Typography>
          <div className={classes.colorPicker}>
            <SketchPicker color={headerColor} onChangeComplete={handleHeaderColorChange} />
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default ThemeConfigurator;
