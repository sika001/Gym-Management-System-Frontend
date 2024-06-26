import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../../Components/Auth Context/AuthContext";

const ProtectedRoute = ({ children, accessBy }) => {
    const { user } = useContext(AuthContext);

    if (accessBy === "non-authenticated") {
        if (!user) {
            return children;
        }
    } else if (accessBy === "authenticated") {
        if (user) {
            console.log("Proslo kroz authenticated");
            return children;
        }
    }
    return <Navigate to="/"></Navigate>;
};

export default ProtectedRoute;
