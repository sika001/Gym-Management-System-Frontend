import TextField from "@mui/material/TextField";
import BasicDatePicker from "../../Utilities/DatePickers/datepickers";
import {
    validateName,
    validatePhone,
    validateAddress,
} from "../../Utilities/RegExpValidators/validators";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import environment from "../../environment";
import moment from "moment";

function PersonalInfoRegister(props) {
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

    const [isValidName, setisValidName] = useState(true);
    const [isValidSurname, setIsValidSurname] = useState(true);
    const [isValidAddress, setisValidAddress] = useState(true);
    const [isValidPhone, setisValidPhone] = useState(true);
    const [isBlured, setIsBlured] = useState(false); //state that tracks when a form is out of focus
    const [isBluredCity, setIsBluredCity] = useState(false);
    const [isBluredCountry, setIsBluredCountry] = useState(false); //need multiple states because of multiple selects
    const [isBluredGym, setIsBluredGym] = useState(false);

    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        ///PROVJERITI ZASTO OVDJE NE ULAZI
        if (!isClicked) return;

        handleClient();
        setIsClicked(false); //resets isClicked state

        props.handleStepValue(); //increments step value
    }, [isClicked]);

    const handleClient = () => {
        const client = {
            Name: name,
            Surname: surname,
            DateOfBirth: date,
            Phone: phone,
            Address: address,
            FK_WorkoutID: null, //will be added on step 3
        };
        props.handleClient(client); //pushes client info to parent component
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

    const api_url = environment.api_url;

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

        const getLocalGyms = axios
            .get(`${api_url}/gym/${city.ID}`)
            .then((res) => setGymsData(res.data))
            .catch((err) => console.log(err));
    }, [city]);

    return (
        <>
            <div className="name">
                <TextField
                    className="formclass"
                    name="nameForm"
                    label="Name"
                    onChange={handleNameChange}
                    onBlur={handleBlur}
                    value={name}
                    error={!isValidName && isBlured} //input form becomes red if name is invalid or field out of focus
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
                    error={!isValidSurname && isBlured}
                />
            </div>
            <div className="date">
                <BasicDatePicker
                    name="dateForm"
                    value={date}
                    handleDateChange={handleDateChange}
                    className={"formclass"}
                    label={"Date of birth"}
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
                    error={!isValidPhone && isBlured}
                />
            </div>
            <div className="address">
                <TextField
                    className="formclass"
                    name="addressForm"
                    label="Address"
                    onChange={handleAddressChange}
                    onBlur={handleBlur}
                    value={address}
                    error={!isValidAddress && isBlured}
                />
            </div>

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
                <FormHelperText>Choose a Country</FormHelperText>
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
                    <FormHelperText>Choose a City</FormHelperText>
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
                    <FormHelperText>Choose a Gym</FormHelperText>
                </FormControl>
            )}
            <div className="submit">
                <Button
                    className="submit-btn"
                    variant="outlined"
                    size="large"
                    onClick={handleClick} //increments step value and pushes client info to parent component
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
                    Next
                </Button>
            </div>
        </>
    );
}

export default PersonalInfoRegister;
