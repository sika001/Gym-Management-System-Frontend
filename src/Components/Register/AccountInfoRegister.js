import TextField from "@mui/material/TextField";
import {  useContext, useEffect, useState } from "react";
import { validateForm } from "../../Utilities/RegExpValidators/validators";
import Button from "@mui/material/Button";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import { useSnackbar } from "notistack";
import AuthContext from "../Auth Context/AuthContext";
import { Box } from "@mui/material";


function AccountInfoRegister(props) {

    const { user } = useContext(AuthContext);
    const [isAdmin] = useState(user && user.isAdmin === 1 ? true : false); //ako je admin kreira se zaposleni, inače klijent nastavlja na sljedeći korak
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isValidEmail, setisValidEmail] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(false);
    const [isBlured, setIsBlured] = useState(false); //state that tracks when a form is out of focus

    const { enqueueSnackbar } = useSnackbar(); //this is used for displaying a snackbar message
    const showSnackbarMessage = (variant, message) => () => {
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar position
        });
    };

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

    const api_url = process.env.REACT_APP_API_URL;

    const handleClick = () => {
        //kreira zaposlenog ako je admin, inače nastavlja na sledeći korak ako je klijent
        if(isAdmin){
            console.log("ADMIN");
            //ako je admin kreiraj novog zaposlenog
            const registerEmployeeFD = new FormData();
            props.employee.forEach((key, value) => {
                registerEmployeeFD.append(value, key);
            }) //dodajemo sve podatke iz PersonalInfoRegister.js u FormData
            
            //stari podaci, dodajemo jos email i password
            registerEmployeeFD.append("Email", email);
            registerEmployeeFD.append("Password", password);

            //pozivamo api za kreiranje novog zaposlenog (takođe se radi preko register metode, slanjem formData objekta)
            jwtInterceptor.post(`${api_url}/register`, registerEmployeeFD, 
                {
                    headers: {
                        "Content-Type": "multipart/form-data", // Important: Set the content type to 'multipart/form-data'
                    },
                    withCredentials: true
                })
                .then((response) => {
                    showSnackbarMessage("success", "Uspješno kreiran novi zaposleni!")();
                    console.log(response.data);
                }).catch((error) => {
                    showSnackbarMessage("error", "Greška prilikom kreiranja novog zaposlenog!")();
                    console.log(error);
                }
            );

            
        }else{
            console.log("KLIJENT");
            //ako je klijent, šalji podatke u parent komponentu i idi na sledeći korak
            handleRole();
            props.handleStepValue();
        }
    };

    const handleRole = () => {
        const role = new FormData();

        role.append("Email", email);
        role.append("Password", password);

        //ako admin registruje zaposlenog, onda je isEmployee = 1, inače, ako se klijent sam registruje, onda je isClient = 1
        isAdmin ? role.append("isEmployee", 1) : role.append("isClient", 1); 

        props.handleRole(role);
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
            {/* Renders only on props.step 2 */}
            <TextField
                className="formclass"
                name="emailForm"
                label="Email"
                onChange={handleEmailChange}
                onBlur={handleBlur}
                value={email}
                error={!isValidEmail && isBlured}
            />
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

            <Button
                sx={{width: 200}}
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
                {!isAdmin ? "Dalje" : "Kreiraj zaposlenog!"}
            </Button>
        </Box>
    );
}

export default AccountInfoRegister;
