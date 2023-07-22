// import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { validateForm } from "../../Utilities/RegExpValidators/validators";
import AuthContext from "../Auth Context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isValidEmail, setisValidEmail] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isBlured, setIsBlured] = useState(false); //state that tracks when a form is out of focus

    const { login } = useContext(AuthContext);

    const handleEmailChange = (event) => {
        const email = event.target.value;
        setEmail(email);

        const formType = event.target.name === "emailForm" ? "emailForm" : "passwordForm";
        setisValidEmail(validateForm(email, formType));
    };

    const handlePasswordChange = (event) => {
        const password = event.target.value;
        setPassword(password);

        const formType = event.target.name === "emailForm" ? "emailForm" : "passwordForm";
        setIsValidPassword(validateForm(password, formType));
    };

    const handleBlur = () => {
        setIsBlured(true);
    };

    async function loginSubmit() {
        let payload = {
            Email: email,
            Password: password,
        };
        await login(payload);
    }
    return (
        <form className="login-container">
            <div className="greeting">
                <h1>Please log in!</h1>
            </div>
            <div className="email">
                <TextField
                    className="formclass"
                    name="emailForm"
                    label="Email"
                    onChange={handleEmailChange}
                    onBlur={handleBlur}
                    value={email}
                    error={!isValidEmail && isBlured} //input form becomes red if mail is invalid or field out of focus
                />
            </div>

            <div className="password">
                <TextField
                    className="formclass"
                    name="passwordForm"
                    label="Password"
                    type="password"
                    onChange={handlePasswordChange}
                    onBlur={handleBlur}
                    value={password}
                    error={!isValidPassword && isBlured} //input form becomes red if mail is invalid or field out of focus
                />
            </div>

            <div className="submit">
                <Button
                    className="submit-btn"
                    variant="outlined"
                    size="large"
                    disabled={
                        !isValidPassword ||
                        !isValidEmail ||
                        email.length === 0 ||
                        password.length === 0
                    }
                    onClick={loginSubmit}
                >
                    Login
                </Button>
            </div>
            <Link to={"/register"}>
                <div className="register-text">
                    <h4>Don't have an account? Register here</h4>
                </div>
            </Link>
        </form>
    );
}

export default Login;
