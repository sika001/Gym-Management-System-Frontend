import TextField from "@mui/material/TextField";
import { useState } from "react";
import { validateForm } from "../../Utilities/RegExpValidators/validators";
import Button from "@mui/material/Button";

function AccountInfoRegister(props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isValidEmail, setisValidEmail] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(false);
    const [isBlured, setIsBlured] = useState(false); //state that tracks when a form is out of focus

    const handleBlur = () => {
        setIsBlured(true);
    };
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

    const handleConfirmPasswordChange = (event) => {
        const confirmPassword = event.target.value;
        setConfirmPassword(confirmPassword);

        if (password === confirmPassword) setIsValidConfirmPassword(true);
        else setIsValidConfirmPassword(false);
    };

    const handleClick = () => {
        props.handleStepValue(); //increments props.step value
        handleRole(); //sends role object to parent component
    };

    const handleRole = () => {
        const role = {
            // FK_ClientID: null, //will be added on step 3
            Email: email,
            Password: password,
            isClient: 1, //CHANGE THIS WHEN SETTING UP ADMIN ACCOUNT
        };
        props.handleRole(role);
    };
    return (
        <>
            {/* Renders only on props.step 2 */}
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
                    error={!isValidPassword && isBlured} //input form becomes red if password is invalid or field out of focus
                />
            </div>
            <div className="password">
                <TextField
                    className="formclass"
                    name="confirmPasswordForm"
                    label="Confirm Password"
                    type="password"
                    onChange={handleConfirmPasswordChange}
                    onBlur={handleBlur}
                    value={confirmPassword}
                    disabled={!isValidPassword || password.length === 0} //input form becomes red if password is invalid or field out of focus
                    error={!isValidConfirmPassword && isBlured && !confirmPassword.length === 0} //input form becomes red if password is invalid or field out of focus
                />
            </div>

            <div className="submit">
                <Button
                    className="submit-btn"
                    variant="outlined"
                    size="large" //-2 because props.steps starts at 0, and on the last props.step should be submit
                    onClick={handleClick} //increments props.step value
                    disabled={
                        email.length === 0 ||
                        password.length === 0 ||
                        confirmPassword.length === 0 ||
                        !isValidPassword ||
                        !isValidEmail ||
                        !isValidConfirmPassword
                    }
                >
                    Next
                </Button>
            </div>
        </>
    );
}

export default AccountInfoRegister;
