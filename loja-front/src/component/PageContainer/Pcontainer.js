import React from "react";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  pageContainer: {
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    padding: theme.spacing(2),
    paddingTop: '6px',
     justifyContent: "center", // centraliza horizontalmente
      
  },
  main: {
    flex: 1,
       backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    padding: "2rem",
    width: "100%",
    maxWidth: ({ size }) => size, // largura máxima baseada na prop
    transition: "max-width 0.3s ease",
  },
}));

const PageContainer = ({ children }) => {
  const classes = useStyles();

  return (
    <div className={classes.pageContainer}>
      <div className="d-flex flex-grow-1">
        <main className={`${classes.main} flex-grow-1`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageContainer;