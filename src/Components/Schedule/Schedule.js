import ScheduleComponent from "./ScheduleComponent";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import { useEffect, useState } from "react";
import Loader from "../../Utilities/Loader/Loader";
import { useSnackbar } from "notistack";
import { Box } from "@mui/material";

function Schedule() {
    const [employeeWorkouts, setEmployeeWorkouts] = useState([]); //contains info about personal coaches, their workouts and time schedules

    const [isLoading, setIsLoading] = useState(true);

    const { enqueueSnackbar } = useSnackbar(); //za prikaz obavještenja (greška ili uspjeh)

    const showSnackbarMessage = (variant, message) => () => {
        // variant može biti: success, error, warning, info, default
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar pozicija
        });
    };

    const api_url = process.env.REACT_APP_API_URL;

    const [fetchData, setFetchData] = useState(true); //used to force a re-render

    const handleSetFetchData = (value) => {
        setFetchData(value);
    };

    useEffect(() => {
        if (!fetchData) return;
        //type/1 represent Coaches
        //initially fetch all coaches and their workouts, and then control fetching from the child component
        setIsLoading(true);
        jwtInterceptor
            .get(`${api_url}/employee/schedule/1`, // /schedule/:employeeTypeID - 1 je za trenera
            { withCredentials: true })
            .then((res) => {
                console.log("Successfully fetched all coaches and workouts", res.data);
                setEmployeeWorkouts(res.data);
            })
            .catch((err) => {
                showSnackbarMessage(
                    "error",
                    "Greška prilikom dovlačenja informacija o trenerima i treninzima!"
                )(); //snackbar poruka
                console.log("Error while fetching coaches and workouts", err);
            })
            .finally(() => {
                setIsLoading(false);
            });

        // setFetchData(false); //reset fetchData to false
    }, [fetchData]);

    return (
        <Box className="schedule-container" sx={{mt: 4}}>
            <Box className="schedule-content">
                {isLoading ? (
                    <Loader />
                ) : (
                    <ScheduleComponent
                        employeeWorkouts={employeeWorkouts}
                        handleSetFetchData={handleSetFetchData}
                        fetchData={fetchData}
                        showSnackbarMessage={showSnackbarMessage}
                    />
                )}
            </Box>
        </Box>
    );
}

export default Schedule;
