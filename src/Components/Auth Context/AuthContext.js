import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Loader from "../../Utilities/Loader/Loader";


const AuthContext = createContext();

export function AuthContextProvider({ children }) {

    const api_url = process.env.REACT_APP_API_URL;

    const [isLoading, setIsLoading] = useState(false); 
    const { enqueueSnackbar } = useSnackbar(); //koristi se sa snackbar obavještenja
    const showSnackbarMessage = (variant, message) => () => {
        // variant može biti: success, error, warning, info, default
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar pozicija
        });
    };

    const [user, setUser] = useState(() => { //sadrži usera iz local storage-a
        let userProfle = localStorage.getItem("userProfile");

        if (userProfle) {
            return JSON.parse(userProfle);
        }
        return null;
    });

    const navigate = useNavigate();

    //main login function
    const login = async (payload) => {
        setIsLoading(true);
        await axios
            .post(`${api_url}/login`, payload, {
                withCredentials: true,
            })
            .then((response) => {
                console.log("Success!", response.data);
                showSnackbarMessage("success", "Uspješno ste se ulogovali!")(); //show snackbar message
                // save user data to local storage (so that we can access it even after page refresh)
                localStorage.setItem("userProfile", JSON.stringify(response.data.results));
                setUser(response.data.results);

                navigate("/");
            })
            .catch((err) => {
                showSnackbarMessage("error", "Pogrešan mail ili šifra!")(); //show snackbar message
                console.log("Wrong email or password!", err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const logout = async () => {
        await axios
            .get(`${api_url}/logout`, { withCredentials: true })
            .then((response) => {
                console.log("Logged out successfully!", response);
                showSnackbarMessage("warning", "Uspješno ste se izlogovali!")(); //show snackbar message
                localStorage.removeItem("userProfile");
                setUser(null);
                navigate("/login");
            })
            .catch((err) => {
                showSnackbarMessage("error", "Greška prilikom odjavljivanja!")(); //show snackbar message
                console.log("Error while trying to log out!", err);
            });
    };

    if(isLoading) {
        return <Loader />
    }
    
    return (
        <>
            <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>{" "}
            {/* renders children components */}
        </>
    );
}

export default AuthContext;
