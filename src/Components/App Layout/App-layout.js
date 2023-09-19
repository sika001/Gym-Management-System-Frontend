import SideBar from "../Side Bar/Sidebar";
import { Outlet } from "react-router-dom";
import Footer from "../Footer/Footer";
import "./App-layout.css";
import { AuthContextProvider } from "../Auth Context/AuthContext";
import { SnackbarProvider } from "notistack";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme"; // Import the theme file

function AppLayout() {
    const height = 70;
    const marginTop = 100;

    return (

        <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={5}>
                <AuthContextProvider>
                    {/* Auth Context Provider allows the user profile (from localstorage) to be used elsewhere */}
                    <div className="app-container">
                        <aside className="side-bar" style={{ height: height + "%" }}>
                            <SideBar />
                        </aside>

                        <main className="main-container">
                            {/* This is the place where the content of the child component will be rendered*/}
                            <Outlet />
                        </main>
                        <footer style={{ marginTop: marginTop + "%" }}>
                            <Footer />
                        </footer>
                    </div>
                </AuthContextProvider>
            </SnackbarProvider>
        </ThemeProvider>
    );
}

export default AppLayout;
