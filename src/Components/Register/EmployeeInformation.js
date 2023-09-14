import axios from "axios";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button, FormControl, FormHelperText, Grid, Input, InputAdornment, InputLabel, MenuItem, Paper, Select, styled } from "@mui/material";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import { useSnackbar } from "notistack";
import dotenv from 'dotenv';
dotenv.config();

///OBRISATI KOMPONENTU

function EmployeeInformation(props){
    
    const [employee, setEmployee] = useState(props.employee);
    const [workoutData, setWorkoutData] = useState(null);
    const [workout, setWorkout] = useState("");
    const [isBluredWrkt, setIsBluredWrkt] = useState(false);
    const [checkbox, setCheckbox] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        setIsLoading(true);
        const getWorkoutProgramsData = axios
            .get(`${api_url}/workout`)
            .then((res) => {
                setWorkoutData(res.data)
                console.log("Workout data: ", res.data)
            })
            .catch((err) => console.log("GRESKA WORKOUT", err))
            .finally(() => setIsLoading(false));
    }, []);


    const handleWorkoutChange = (event) => {
        setWorkout(event.target.value);
        console.log("Workout: ", event.target.value);
    }

    const handleBlurWrkt = () => {
        setIsBluredWrkt(true);
    }

    const handleCheckbox = (event) => {
        setCheckbox(event.target.checked);
    }
    
    const handleSubmit = () => {
        jwtInterceptor.post(`${api_url}/employee`, employee, {
            withCredentials: true,
        }).then((res) => {
            console.log("Employee created: ", res.data);
            showSnackbarMessage("success", "Korisnik je uspješno kreiran!")();
            setEmployee(res.data);
        }).catch((err) => {
            console.log("GRESKA EMPLOYEE", err)
            showSnackbarMessage("error", "Greška prilikom kreiranja korisnika!")();
        });

    }

    if(isLoading) return <h1>Loading...</h1>


    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} xl={3} sx={{backgroundColor: "#FAF4"}} marginRight={1}>

                    <FormControl sx={{ width: "100%"}}>
                        <Select
                            value={workout || ""}
                            onChange={handleWorkoutChange}
                            displayEmpty
                            onBlur={handleBlurWrkt}
                            error={workout.length === 0 && isBluredWrkt}
                            >
                            {workoutData.map((workoutEl) => {
                                if (
                                    (workoutEl.Type === "Individual Workout" && !workoutEl.FK_EmployeeID) ||
                                    workoutEl.Type === "Group Workout"
                                    ) {
                                        return (
                                            // value is entire object
                                            <MenuItem
                                            value={workoutEl}
                                            key={uuidv4()}
                                            >
                                            <span>
                                                <b>{workoutEl.Name}</b> - ({workoutEl.Type})
                                                
                                            </span>
                                        </MenuItem>
                                    );
                                }
                                return null;
                            })}
                        </Select>

                        <FormHelperText>Choose a Workout Program</FormHelperText>
                    </FormControl>
                </Grid>
                    
                <Grid item lg={6} xs={12} sm={6} xl={3} sx={{backgroundColor: "#FAF4"}}>

                    {/* Salary */}
                    <FormControl sx={{ m: 1, minWidth: 120}} variant="standard">
                        <InputLabel htmlFor="salary-amount">Iznos zarade</InputLabel>
                        <Input
                            id="salary-amount"
                            endAdornment={<InputAdornment position="end">€</InputAdornment>} //€ na pocetku polja
                            />
                    </FormControl>
                </Grid>

                <Grid item lg={6} xs={12} sm={6} xl={4} sx={{backgroundColor: "#FAF4"}}>
                    {/* Dugme kreiraj zaposlenog */}
                    <Button variant="contained" 
                            sx={{backgroundColor: "#1A2027", color: "#fff", marginTop: "1.5rem"}}
                            onClick={handleSubmit}>
                        Kreiraj zaposlenog
                    </Button>
                </Grid>
            </Grid>
        </>
    );
}

export default EmployeeInformation;