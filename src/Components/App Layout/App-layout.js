import SideBar from "../Side Bar/Sidebar";
import { Outlet } from "react-router-dom";
import "./App-layout.css";
import AuthContext, { AuthContextProvider } from "../Auth Context/AuthContext";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme"; // Import the theme file

function AppLayout() {
    const height = 70;

    return (

        <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={5}>
                <AuthContextProvider>
                    {/* Auth Context Provider omogućava da koristimo trenutno ulogovanog usera (iz local storage-a) svukud*/}
                    <div className="app-container">
                        <aside className="side-bar" style={{ height: height + "%" }}>
                            <SideBar />
                        </aside>

                        <main className="main-container">
                            {/* Ovdje se renderuje ostatak aplikacije */}
                            <Outlet />
                        </main>
                      
                    </div>
                </AuthContextProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default AppLayout;
