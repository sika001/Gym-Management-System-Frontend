import TextField from "@mui/material/TextField";
import { BasicDatePicker } from "../../Utilities/DatePickers/datepickers";
import {
    validateName,
    validatePhone,
    validateAddress,
} from "../../Utilities/RegExpValidators/validators";
import { useState, useEffect, useContext } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import moment from "moment";
import { Box, Input, InputAdornment, InputLabel } from "@mui/material";
import AuthContext from "../Auth Context/AuthContext";
import Loader from "../../Utilities/Loader/Loader";

function PersonalInfoRegister(props) {
    const { user } = useContext(AuthContext); //ulogovani korisnik

    const api_url = process.env.REACT_APP_API_URL;

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone, setPhone] = useState("");
    const [date, setDate] = useState("");
    const [address, setAddress] = useState("");
    const [countryData, setCountryData] = useState([]);
    const [country, setCountry] = useState("");
    const [cityData, setCityData] = useState([]);
    const [city, setCity] = useState("");
    const [gymsData, setGymsData] = useState([]);
    const [gym, setGym] = useState("");
    const [file, setFile] = useState("");
    const [fileName, setFileName] = useState("");
    const [salary, setSalary] = useState(450);
    const [employeeType, setEmployeeType] = useState([]);
    const [selectedEmployeeType, setSelectedEmployeeType] = useState(null);

    const [isValidName, setisValidName] = useState(true);
    const [isValidSurname, setIsValidSurname] = useState(true);
    const [isValidAddress, setisValidAddress] = useState(true);
    const [isValidPhone, setisValidPhone] = useState(true);
    const [isBlured, setIsBlured] = useState(false); //state that tracks when a form is out of focus
    const [isBluredCity, setIsBluredCity] = useState(false);
    const [isBluredCountry, setIsBluredCountry] = useState(false); //need multiple states because of multiple selects
    const [isBluredGym, setIsBluredGym] = useState(false);
    const [isBluredEmployeeType, setIsBluredEmployeeType] = useState(false);

    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        if (!isClicked) return;

        handleUser();

        setIsClicked(false); //resets isClicked state

        props.handleStepValue(); //increments step value
    }, [isClicked]);

    useEffect(() => {
        if (!props.isAdmin) return;
        // dovlači tip zaposlenog (trener, recepcionar...)
        //ne treba jwtInterceptor jer je ruta otvorena za sve
        axios
            .get(`${api_url}/employee/type`)
            .then((res) => {
                setEmployeeType(res.data);
                console.log("EMPLOYEE TYPE: ", res.data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    useEffect(() => {
        if (!employeeType) {
            console.log("LOADING");
            return <Loader />;
        }
    }, []);

    const handleUser = () => {
        //Not using objects, but formData, because of the file upload
        const userFD = new FormData();
        userFD.append("Name", name);
        userFD.append("Surname", surname);
        userFD.append("DateOfBirth", date);
        userFD.append("Phone", phone);
        userFD.append("Address", address);
        userFD.append("FK_WorkoutID", null);
        userFD.append("Picture", file);
        userFD.append("PictureName", fileName); //sends the file name to the backend as well (needed for multer)
        userFD.append("FK_GymID", gym.ID);

        //pushes user (client or employee) information  to parent component
        if (user && user.isAdmin) {
            //ako je admin, kreiraj zaposlenog (mora biti ulogovan zato ide uslov za user &&)
            userFD.append("FK_EmployeeTypeID", selectedEmployeeType.ID); // 1 - coach, 2 - receptionist
            userFD.append("Salary", salary);
            props.handleEmployee(userFD);
        } else {
            props.handleClient(userFD);
        }
    };

    const handleClick = () => {
        setIsClicked(true);
    };

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

    const handleCountryChange = (event) => {
        const cntry = event.target.value;
        setCountry(cntry);
        setCity(""); //when country is changed, city is reset
    };

    const handleCityChange = (event) => {
        const cty = event.target.value;
        setCity(cty);
        setGym(""); //when city is changed, gym is reset
    };

    const handleGymChange = (event) => {
        const gymVal = event.target.value;
        setGym(gymVal);
        props.handleGym(gymVal); //pushes gym info to parent component
    };

    const handleBlur = () => {
        setIsBlured(true);
    };

    const handleBlurCity = () => {
        setIsBluredCity(true);
    };

    const handleBlurCountry = () => {
        setIsBluredCountry(true);
    };

    const handleBlurGym = () => {
        setIsBluredGym(true);
    };

    const handleSalaryChange = (event) => {
        const salary = event.target.value;
        console.log("SALARY: ", salary);
        setSalary(salary);
    };

    const handleEmployeeTypeChange = (event) => {
        const employeeType = event.target.value;

        console.log("EMPLOYEE TYPE: ", employeeType);
        setSelectedEmployeeType(employeeType);
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

    useEffect(() => {
        const getAllCountries = axios
            .get(`${api_url}/country`)
            .then((res) => {
                setCountryData(res.data);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        if (country === "") return;

        const getAllCities = axios
            .get(`${api_url}/city/${country.ID}`)
            .then((res) => {
                setCityData(res.data);
            })
            .catch((err) => console.log(err));
    }, [country]);

    useEffect(() => {
        if (city === "") return;
        //NAPRAVITI DA
        //ako je korisnik admin, dovuci sve njegove teretane, inače, dovuci sve teretane u gradu

        axios
            .get(`${api_url}/gym/${city.ID}`)
            .then((res) => setGymsData(res.data))
            .catch((err) => console.log(err));
    }, [city]);

    return (
        <>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mr: '7%'}}>
                <TextField
                    className="formclass"
                    name="nameForm"
                    label="Ime"
                    onChange={handleNameChange}
                    onBlur={handleBlur}
                    value={name}
                    error={!isValidName && isBlured}
                />
                <TextField
                    className="formclass"
                    name="surnameForm"
                    label="Prezime"
                    onChange={handleSurnameChange}
                    onBlur={handleBlur}
                    value={surname}
                    error={!isValidSurname && isBlured}
                />
                <BasicDatePicker
                    name="dateForm"
                    value={date}
                    handleDateChange={handleDateChange}
                    className={"formclass"}
                    label={"Datum rođenja"}
                    disableFuture={true}
                    disablePast={false}
                />
                <TextField
                    className="formclass"
                    name="phoneForm"
                    label="Broj telefona"
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    value={phone}
                    error={!isValidPhone && isBlured}
                />
            
                <TextField
                    className="formclass"
                    name="addressForm"
                    label="Adresa"
                    onChange={handleAddressChange}
                    onBlur={handleBlur}
                    value={address}
                    error={!isValidAddress && isBlured}
                />
                <Box>
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <Select
                            value={country ? country : ""}
                            onChange={handleCountryChange}
                            displayEmpty
                            key={country.ID}
                            error={country.length === 0 && isBluredCountry}
                            onBlur={handleBlurCountry}
                        >
                            {countryData.map((countryEl) => (
                                <MenuItem value={countryEl} key={uuidv4()}>
                                    {countryEl.Name}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>Odaberite državu</FormHelperText>
                    </FormControl>

                    {country && (
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <Select
                                value={city ? city : ""}
                                onChange={handleCityChange}
                                displayEmpty
                                key={city.ID}
                                error={city.length === 0 && isBluredCity}
                                onBlur={handleBlurCity}
                                >
                                {cityData.map((cityEl) => (
                                    <MenuItem value={cityEl} key={uuidv4()}>
                                        {cityEl.Name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Odaberite grad</FormHelperText>
                        </FormControl>
                    )}
                    {city && (
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <Select
                                value={gym ? gym : ""}
                                onChange={handleGymChange}
                                displayEmpty
                                key={gym.ID}
                                error={gym.length === 0 && isBluredGym}
                                onBlur={handleBlurGym}
                                >
                                {gymsData.map((gymEl) => (
                                    <MenuItem value={gymEl} key={uuidv4()}>
                                        {gymEl.Name}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Odaberite teretanu</FormHelperText>
                        </FormControl>
                    )}
            </Box>
            {/* NE DIRAJ name: Picture (mora da bude ista kao na backendu muler-config.js)*/}
            <input
                type="file"
                id="fileInput"
                name="Picture"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {/* Button to trigger file input */}
            <Button variant="contained" onClick={handleFileButtonClick}>
                Odaberi sliku
            </Button>
            <p>{file ? file.name : "Nema selektovanih slika!"}</p>

            {/* Pošto koriste iste komponente, ovaj dio o zaradama se prikazuje samo za Admina*/}
            {props.isAdmin && (
                <>
                    <FormControl sx={{ m: 1, minWidth: 120 }} variant="standard">
                        <InputLabel htmlFor="salary-amount">Iznos zarade</InputLabel>
                        <Input
                            id="salary-amount"
                            endAdornment={<InputAdornment position="end">€</InputAdornment>} //€ na pocetku polja
                            value={salary}
                            onChange={handleSalaryChange}
                            />
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 120 }} variant="standard">
                        <InputLabel htmlFor="employee-type">Tip zaposlenog</InputLabel>
                        <Select
                            value={selectedEmployeeType || ""}
                            onChange={handleEmployeeTypeChange}
                            onClick={() => setIsBluredEmployeeType(true)}
                            error={
                                employeeType && employeeType.length === 0 && isBluredEmployeeType
                            }
                        >
                            {employeeType &&
                                employeeType.map((employeeTypeEl) => {
                                    return (
                                        // Set the value to the selected employeeType
                                        <MenuItem value={employeeTypeEl} key={uuidv4()}>
                                            {employeeTypeEl.Type}
                                        </MenuItem>
                                    );
                                })}
                        </Select>
                    </FormControl>
                </>
            )}

                <Button
                    className="submit-btn"
                    variant="outlined"
                    size="large"
                    onClick={handleClick} //increments step value and pushes user info to parent component
                    disabled={
                        !isValidName ||
                        !isValidSurname ||
                        !isValidPhone ||
                        !isValidAddress ||
                        name.length === 0 ||
                        surname.length === 0 ||
                        phone.length === 0 ||
                        address.length === 0 ||
                        date.length === 0 ||
                        country.length === 0 ||
                        city.length === 0 ||
                        gym.length === 0
                    }
                >
                    Dalje
                </Button>
        </Box>
    </>
    );
}

export default PersonalInfoRegister;
