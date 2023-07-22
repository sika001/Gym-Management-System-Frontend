import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import environment from "../../environment";

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
    const api_url = environment.api_url;

    const [user, setUser] = useState(() => {
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

                localStorage.setItem("userProfile", JSON.stringify(response.data.results)); // save user data to local storage
                setUser(response.data.results);

                navigate("/");
            })
            .catch((err) => {
                console.log("Wrong email or password!", err);
            });
    };

    const logout = async () => {
        await axios
            .get(`${api_url}/logout`, { withCredentials: true })
            .then((response) => {
                console.log("Logged out successfully!", response);
                localStorage.removeItem("userProfile");
                setUser(null);
                navigate("/login");
            })
            .catch((err) => {
                console.log("Error while logging out!", err);
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
