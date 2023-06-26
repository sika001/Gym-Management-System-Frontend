import Stepper from "../../Utilities/Stepper/Stepper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Link } from "react-router-dom";
import React from "react";
// import BasicDatepicker from "../../Utilities/DatePickers/datepickers";
import "./Register.css";
function Register() {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [date, setDate] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [Fk_WorkoutID, setFK_WorkoutID] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [isValidName, setisValidName] = useState(true);
    const [isValidSurname, setIsValidSurname] = useState(true);
    const [isValidDate, setIsValidDate] = useState(true);
    const [isValidEmail, setisValidEmail] = useState(true);
    const [isValidFk_WorkoutID, setIsValidFk_WorkoutID] = useState(true);

    const [isValidPhone, setisValidPhone] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);

    const [isBlured, setIsBlured] = useState(false); //state that tracks when a form is out of focus

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

    const handleNameChange = (event) => {
        //DODATI LOGIKU ZA OVO
        const password = event.target.value;
        setPassword(password);

        const formType = event.target.name === "emailForm" ? "emailForm" : "passwordForm";
        setIsValidPassword(validateForm(password, formType));
    };

    const handleSurnameChange = (event) => {
        // I OVO
        const password = event.target.value;
        setPassword(password);

        const formType = event.target.name === "emailForm" ? "emailForm" : "passwordForm";
        setIsValidPassword(validateForm(password, formType));
    };
    const handleDateChange = (event) => {
        // I OVO
        const password = event.target.value;
        setPassword(password);

        const formType = event.target.name === "emailForm" ? "emailForm" : "passwordForm";
        setIsValidPassword(validateForm(password, formType));
    };
    const handlePhoneChange = (event) => {
        //DODATI LOGIKU ZA OVO
        const password = event.target.value;
        setPassword(password);

        const formType = event.target.name === "emailForm" ? "emailForm" : "passwordForm";
        setIsValidPassword(validateForm(password, formType));
    };
    const handleFk_WorkoutIDChange = (event) => {
        //DODATI LOGIKU ZA OVO
        const password = event.target.value;
        setPassword(password);

        const formType = event.target.name === "emailForm" ? "emailForm" : "passwordForm";
        setIsValidPassword(validateForm(password, formType));
    };
    const validateForm = (data, formType) => {
        const emailRegExp = /^[A-Za-z0-9+\-_~]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

        const regExp = formType === "emailForm" ? emailRegExp : passwordRegex;
        const isValid = regExp.test(data);

        return isValid;
    };

    const handleBlur = () => {
        setIsBlured(true);
    };

    return (
        <div>
            <h1>Register component</h1>
            <Stepper activeStep={1} />

            <form className="login-container">
                <div className="greeting">
                    <h1>Please sign up!</h1>
                </div>
                <div className="name">
                    <TextField
                        className="formclass"
                        name="nameForm"
                        label="Name"
                        onChange={handleNameChange}
                        onBlur={handleBlur}
                        value={name}
                        error={!isValidName && isBlured} //input form becomes red if mail is invalid or field out of focus
                    />
                </div>
                <div className="surname">
                    <TextField
                        className="formclass"
                        name="surnameForm"
                        label="Surname"
                        onChange={handleSurnameChange}
                        onBlur={handleBlur}
                        value={surname}
                        error={!isValidSurname && isBlured} //input form becomes red if mail is invalid or field out of focus
                    />
                </div>
                <div className="date">
                    {/* <BasicDatepicker /> */}
                    <TextField
                        className="formclass"
                        name="dateForm"
                        label="Date of birth"
                        onChange={handleDateChange}
                        onBlur={handleBlur}
                        value={date}
                        error={!isValidDate && isBlured} //input form becomes red if mail is invalid or field out of focus
                    />
                </div>
                <div className="phone">
                    <TextField
                        className="formclass"
                        name="phoneForm"
                        label="Phone number"
                        onChange={handlePhoneChange}
                        onBlur={handleBlur}
                        value={phone}
                        error={!isValidPhone && isBlured} //input form becomes red if mail is invalid or field out of focus
                    />
                </div>
                <div className="workout">
                    <TextField
                        className="formclass"
                        name="workoutForm"
                        label="WorkoutID"
                        onChange={handleFk_WorkoutIDChange}
                        onBlur={handleBlur}
                        value={Fk_WorkoutID}
                        error={!isValidFk_WorkoutID && isBlured} //input form becomes red if mail is invalid or field out of focus
                    />
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
                        type="submit"
                        disabled={
                            !isValidPassword ||
                            !isValidEmail ||
                            email.length === 0 ||
                            password.length === 0
                        }
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
        </div>
    );
}

export default Register;
