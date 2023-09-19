import { createTheme } from "@mui/material";

const theme = createTheme({
    typography: {
      fontFamily: "Public Sans, sans-serif, Arial, Helvetica",
    },
    palette: {
      primaryGreen: {
        darkGreen: '#004B50',
        main: "#007867",
        light: '#5BE49B',
        lighterGreen: '#C8FAD6',
      },
      primaryGrey: {
        darkGrey: '#637381',
        main: '#C4CDD5',
        light: '#DFE3E8'
      },
      secondary: {
        main: "#5be49b",
      },
    },

    title: {
      fontSize: "24px",
      fontWeight: "bold",
      color: "#004B50",
      textAlign: "center",
    },

    boxShadows: {
      primary: `0px 5px 5px 0px #DFE3E8`,
    },
    
  });
  
  export default theme;