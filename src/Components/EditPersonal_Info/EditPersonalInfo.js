import { useContext } from "react";
import AuthContext from "../Auth Context/AuthContext";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import { validateForm } from "../../Utilities/RegExpValidators/validators";
import Button from "@mui/material/Button";
import { BasicDatePicker } from "../../Utilities/DatePickers/datepickers";
import {
    validateName,
    validatePhone,
    validateAddress,
} from "../../Utilities/RegExpValidators/validators";
import moment from "moment";
import dayjs from "dayjs";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import { useSnackbar } from "notistack";
import { Avatar, Grid, IconButton } from "@mui/material";
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import { useNavigate } from "react-router-dom";


function EditPersonalInfo(props) {
    const { user } = useContext(AuthContext); //ulogovani korisnik (iz local storage-a)
    const [isEditingEmployee] = useState(props.isEditingEmployee); 

    const [editUser] = useState(()=>{ 
        //ako se edituje zaposleni, editUser je zaposleni, inače je editUser trenutno ulogovani korisnik (može biti i zaposleni)
        //ovo je potrebno jer istu ovu komponentu koristim i za Account, gdje korisnik sam sebi mijenja podatke
        if(isEditingEmployee){
            console.log("EMPLOYEE: ", props.employee);
            return props.employee;
        }else{
            console.log("USER: ", user);
            return user;
        }
    }) 
    const navigate = useNavigate();

    const [email, setEmail] = useState(editUser.Email);
    const [password, setPassword] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState(null);
    const [isValidEmail, setisValidEmail] = useState(true);
    const [isValidPassword, setIsValidPassword] = useState(true);
    const [isValidConfirmPassword, setIsValidConfirmPassword] = useState(false);
    const [isBlured, setIsBlured] = useState(false); //state that tracks when a form is out of focus

    const [isEmailEdited, setIsEmailEdited] = useState(false); //used to check if email is edited 

    const [name, setName] = useState(editUser.Name);
    const [surname, setSurname] = useState(editUser.Surname);
    const [phone, setPhone] = useState(editUser.Phone);
    const [date, setDate] = useState(moment(editUser.DateOfBirth).format("YYYY-MM-DD"));
    const [address, setAddress] = useState(editUser.Address);

    const [file, setFile] = useState("");
    const [fileName, setFileName] = useState(editUser.Picture);

    const [isValidName, setisValidName] = useState(true);
    const [isValidSurname, setIsValidSurname] = useState(true);
    const [isValidAddress, setisValidAddress] = useState(true);
    const [isValidPhone, setisValidPhone] = useState(true);

    // PROVJERITI RADI LI FILE UPLOAD

    const { enqueueSnackbar } = useSnackbar(); //this is used for displaying a snackbar message
    const showSnackbarMessage = (variant, message) => () => {
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar position
        });
    };
    const api_url = process.env.REACT_APP_API_URL;

    const convertFormDataToJSON = (formData) => {
        let obj = {};
        for (let key of formData.keys()) {
            obj[key] = formData.get(key);
        }
        return obj;
    };
    const handleClickUpdateData = ()=>{
        const editedUser = new FormData(); //have to use FormData because of the file upload
        editedUser.append("Name", name);
        editedUser.append("Surname", surname);
        editedUser.append("DateOfBirth", date);
        editedUser.append("Phone", phone);
        editedUser.append("Address", address);
        editedUser.append("Picture", file);
        editedUser.append("PictureName", fileName); //sends the file name to the backend as well (needed for multer)
        // console.log("CLIENT: ", ...editedUser);
        
        const updatedUser = convertFormDataToJSON(editedUser);
        console.log("CONVERT TO JSON: ", updatedUser);
        console.log("OLD STRG", (localStorage.getItem("userProfile")));
        
        const userLink = editUser.FK_EmployeeID ? "employee" : "client"; //if user is an employee, send the request to the employee endpoint, else send it to the client endpoint
        //editing user's information
        jwtInterceptor.put(`${api_url}/${userLink}/${editUser.ID}`, 
        editedUser
        , {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
            
        }).then((res)=>{
            console.log("Success!", res);
            
            editedUser.append("Email", isEmailEdited ? email : null) //if email is edited, send the new email, else it will be null (this case is handled on backend)
            //by default, password is null
            editedUser.append("Password", password)
            editedUser.append("FK_EmployeeID", editUser.FK_EmployeeID);
            editedUser.append("FK_ClientID", editUser.FK_ClientID);
            
            if(!isEmailEdited && !password) {
                showSnackbarMessage("success", "Uspješno ste ažurirali lične podatke!")();
                navigate(editUser.FK_EmployeeID ? "/employees" : "/members");
            }; //ako nije mijenjao email i password, ne treba da se updateuje login data, pa se odmah preusmjerava na dashboard

            const updatedUserData = {
                ID: editUser.ID,
                Name: name,
                Surname: surname,
                DateOfBirth: date,
                Phone: phone,
                Address: address,
                Picture: fileName,
                Email: isEmailEdited ? email : editUser.Email, //if email is edited, send the new email, else it will be the old one
                FK_EmployeeID: editUser.FK_EmployeeID,
                FK_ClientID: editUser.FK_ClientID,
                isClient: editUser.isClient,
                isEmployee: editUser.isEmployee,
                isAdmin: editUser.isAdmin,
                
            };

            localStorage.setItem("userProfile", JSON.stringify(updatedUserData)); //update the user profile in local storage

            //Update login information
            if(isEmailEdited || confirmPassword){
                    //if email and password are not empty, update the login information (email is predefined, but password isn't)
                    jwtInterceptor.put(`${api_url}/login`, {
                        Email: email,
                        Password: password,
                        FK_ClientID: editUser.FK_ClientID,
                        FK_EmployeeID: editUser.FK_EmployeeID,
                    },
                    {withCredentials: true})
                    .then((res)=>{
                        showSnackbarMessage("success", "Uspješno ažuriranje podataka!")();
                        navigate(editUser.FK_EmployeeID ? "/employees" : "/members");
                    })
                    .catch((err)=>{
                        console.log("Error while trying to update login information!",err);
                        showSnackbarMessage("error", "Greška prilikom ažuriranja podataka za prijavljivanje!")();
                    })

                }else{
                    showSnackbarMessage("success", "Client successfully updated!")();
                }
            }).catch((err)=>{
                console.log("An error ",err);
                showSnackbarMessage("error", "An error occured while trying to update a client!")();
            })

    }

    const handleNameChange = (event) => {
        const name = event.target.value;
        setName(name);

        setisValidName(validateName(name));
    };

    const handleSurnameChange = (event) => {
        const surname = event.target.value;
        setSurname(surname);

        setIsValidSurname(validateName(surname));
    };

    const handleDateChange = (date) => {
        const dateRez = moment(date).format("YYYY-MM-DD");
        setDate(dateRez);
    };

    const handlePhoneChange = (event) => {
        const phone = event.target.value;
        setPhone(phone);

        setisValidPhone(validatePhone(phone));
    };

    const handleAddressChange = (event) => {
        const address = event.target.value;
        setAddress(address);

        setisValidAddress(validateAddress(address));
    };

    const handleBlur = (event) => {
        if(!event.target.value){

            setIsBlured(true);
            console.log("BLUR: ", event.target.value);
        }

    };
    const handleEmailChange = (event) => {
        const email = event.target.value;
        setIsEmailEdited(true); 
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

    const handleFileButtonClick = () => {
        document.getElementById("fileInput").click();
    };

    const handleFileChange = (event) => {
        if (!event.target.files[0]) return; //if no file is selected, return

        const file = event.target.files[0];

        const newFile = new File([file], Date.now() + file.name, { type: file.type }); //recreates the file with a new name
        //adds timestamp to the file name to avoid duplicates

        console.log("FILE: ", newFile);
        setFile(newFile);
        setFileName(newFile.name);
    };
;

    
    

    return (
        <>
            <Grid container 
                xl={10} 
                sx={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                    marginTop: '50px', marginBottom:'50px', padding: '20px', backgroundColor: 'white',
                    borderRadius: '10px', boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                "& > *": {ml: 'auto', mr: 'auto', width: '100%'}} //centrira sve elemente unutar grid containera (potomke)
                } 
                spacing={2}
                                    
            >

                <Grid item xl={6} lg={6} md={8} sm={10} xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                    {/* Slika zaposlenog */}
                    <div style={{ position: 'relative', width: 160, height: 160, ml: 'auto', mr: 'auto' }}>
                        <Avatar
                        ///NAPRAVITI OVO DA SE SLIKA PRIKAZUJE
                        src={`${api_url}/uploads/${editUser.Picture}`}
                        alt={editUser.Name + " " + editUser.Surname}
                        sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%', // Make the Avatar round
                        }}
                        />
                        <IconButton
                            onClick={handleFileButtonClick}
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 'auto',
                                height: 'auto',
                                p: 1,
                                background: 'rgba(0, 212, 99, 0.7)',
                                borderRadius: '50%',
                            }}
                            >
                            <AddAPhotoIcon />
                        </IconButton>
                       
                            {/* <p>{file ? file.name : "Nijedna slika nije selektovana"}</p> */}
                    </div>
                        {/* DON'T TOUCH name: Picture (need to be the same as the one on the backend in muler-config.js)*/}
                        <input
                            type="file"
                            id="fileInput"
                            name="Picture"
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                </Grid>


                    <Grid item xl={6} lg={6} md={8} sm={10} xs={12} >
                        <TextField
                            // className="formclass"
                            sx={{width: '100%'}} //width: '100%' čini da  input forma popuni cijeli grid item
                            name="nameForm"
                            label="Name"
                            onChange={handleNameChange}
                            onBlur={handleBlur}
                            value={name}
                            disabled={true}
                            // fullWidth={true}
                            // error={!isValidName && isBlured} //input form becomes red if name is invalid or field out of focus
                        />
                    </Grid>
                    <Grid item lg={6} md={8} sm={10} xs={12}>
                        <TextField
                            // className="formclass"
                            sx={{width: '100%'}}
                            name="surnameForm"
                            label="Surname"
                            onChange={handleSurnameChange}
                            onBlur={handleBlur}
                            value={surname}
                            disabled={true}
                            // error={!isValidSurname && isBlured}
                        />
                    </Grid>
                    <Grid item lg={6} md={8} sm={10} xs={12}>
                        <BasicDatePicker
                            sx={{ width: '100%'}}
                            name="dateForm"
                            date={dayjs(date)}
                            handleDateChange={handleDateChange}
                            // className={"formclass"}
                            label={"Date of birth"}
                            disabled={true}
                            disableFuture={true}
                            disablePast={false}
                        />
                    </Grid>
                    <Grid item lg={6} md={8} sm={10} xs={12}>
                        <TextField
                            // className="formclass"
                            sx={{width: '100%'}}
                            name="phoneForm"
                            label="Phone number"
                            onChange={handlePhoneChange}
                            onBlur={handleBlur}
                            value={phone}
                            error={!isValidPhone && isBlured}
                        />
                    </Grid>
                    <Grid item lg={6} md={8} sm={10} xs={12}>
                        <TextField
                            // className="formclass"
                            sx={{width: '100%'}}
                            name="addressForm"
                            label="Address"
                            onChange={handleAddressChange}
                            onBlur={handleBlur}
                            value={address}
                            error={!isValidAddress && isBlured}
                        />
                    </Grid>
                    <Grid item lg={6} md={8} sm={10} xs={12}>
                        <TextField
                            // className="formclass"
                            sx={{width: '100%'}}
                            name="emailForm"
                            label="Email"
                            onChange={handleEmailChange}
                            onBlur={handleBlur}
                            value={email}
                            error={!isValidEmail && isBlured} //input form becomes red if mail is invalid or field out of focus
                        />
                    </Grid>
                    <Grid item lg={6} md={8} sm={10} xs={12}>
                        <TextField
                            sx={{width: '100%'}}
                            // className="formclass"
                            name="passwordForm"
                            label="New Password"
                            type="password"
                            onChange={handlePasswordChange}
                            // onBlur={handleBlur}
                            value={password}
                            error={password && !isValidPassword} //input form becomes red if password is invalid or field out of focus
                        />
                    </Grid >
                    <Grid item lg={6} md={8} sm={10} xs={12}>
                        <TextField
                            // className="formclass"
                            sx={{width: '100%'}}
                            name="confirmPasswordForm"
                            label="Confirm Password"
                            type="password"
                            onChange={handleConfirmPasswordChange}
                            onBlur={handleBlur}
                            value={confirmPassword}
                            disabled={!isValidPassword || !password} //input form becomes red if password is invalid or field out of focus
                            error={
                                !isValidConfirmPassword && isBlured && !confirmPassword
                            } //input form becomes red if password is invalid or field out of focus
                        />
                    </Grid>
                    
                    

                    <Grid item lg={6} md={8} sm={10} xs={12} sx={{textAlign: 'center'}}>
                        <Button
                            sx={{width: '50%'}}
                            // className="submit-btn"
                            variant="outlined"
                            size="large" 
                            onClick={handleClickUpdateData}
                            disabled={
                                email.length === 0 ||
                                !isValidEmail ||
                                (password &&
                                    (!password ||
                                        !isValidPassword ||
                                        !confirmPassword ||
                                        !isValidConfirmPassword))
                            }
                        >
                            Update
                        </Button>
                    </Grid>
            </Grid>
        </>
    );
}

export default EditPersonalInfo;
