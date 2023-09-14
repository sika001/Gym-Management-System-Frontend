import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import dotenv from 'dotenv';
dotenv.config();

const AuthContext = createContext();

export function AuthContextProvider({ children }) {

    const api_url = process.env.API_URL;
    const { enqueueSnackbar } = useSnackbar(); //this is used for displaying a snackbar message
    const showSnackbarMessage = (variant, message) => () => {
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar position
        });
    };

    const [user, setUser] = useState(() => { //this is used for storing the user profile
        let userProfle = localStorage.getItem("userProfile");

        if (userProfle) {
            return JSON.parse(userProfle);
        }
        return null;
    });

    const navigate = useNavigate();

    //main login function
    const login = async (payload) => {
        await axios
            .post(`${api_url}/login`, payload, {
                withCredentials: true,
            })
            .then((response) => {
                console.log("Success!", response.data);
                showSnackbarMessage("success", "Logged in successfully!")(); //show snackbar message
                // save user data to local storage (so that we can access it even after page refresh)
                localStorage.setItem("userProfile", JSON.stringify(response.data.results));
                setUser(response.data.results);

                navigate("/");
            })
            .catch((err) => {
                showSnackbarMessage("error", "Wrong email or password!")(); //show snackbar message
                console.log("Wrong email or password ddd!", err);
            });
    };

    const logout = async () => {
        await axios
            .get(`${api_url}/logout`, { withCredentials: true })
            .then((response) => {
                console.log("Logged out successfully!", response);
                showSnackbarMessage("warning", "Logged out successfully!")(); //show snackbar message
                localStorage.removeItem("userProfile");
                setUser(null);
                navigate("/login");
            })
            .catch((err) => {
                showSnackbarMessage("error", "Error while trying to log out!")(); //show snackbar message
                console.log("Error while trying to log out!", err);
            });
    };

    return (
        <>
            <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>{" "}
            {/* renders children components */}
        </>
    );
}

export default AuthContext;
