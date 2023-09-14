import ScheduleComponent from "./ScheduleComponent";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import { useEffect, useState } from "react";
import dotenv from 'dotenv';
dotenv.config();

function Schedule() {
    const [employeeWorkouts, setEmployeeWorkouts] = useState([]); //contains info about personal coaches, their workouts and time schedules

    const [isLoading, setIsLoading] = useState(true);

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
            .get(`${api_url}/employee/type/1`, { withCredentials: true })
            .then((res) => {
                console.log("Successfully fetched all coaches and workouts", res.data);
                setEmployeeWorkouts(res.data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("Error while fetching coaches and workouts", err);
            });

        // setFetchData(false); //reset fetchData to false
    }, [fetchData]);

    return (
        <div className="schedule-container">
            <h1>Schedule</h1>
            <div className="schedule-content">
                {!isLoading ? (
                    <ScheduleComponent
                        employeeWorkouts={employeeWorkouts}
                        handleSetFetchData={handleSetFetchData}
                        fetchData={fetchData}
                    />
                ) : (
                    <h1>Loading...</h1>
                )}
            </div>
        </div>
    );
}

export default Schedule;
