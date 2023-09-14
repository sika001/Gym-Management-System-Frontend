import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../Auth Context/AuthContext";
import jwtInterceptor from "../../../Utilities/Interceptors/jwtInterceptor";
import { BarChart } from "../../../Utilities/Charts/Charts";
import moment from "moment";
import { BasicDatePicker } from "../../../Utilities/DatePickers/datepickers";
import "./Attendance.css";
import dotenv from 'dotenv';
dotenv.config();

function Attendance(props) {
    const { user } = useContext(AuthContext);
    const api_url = process.env.REACT_APP_API_URL;

    const [isLoading, setIsLoading] = useState(false);
    const [arrivalData, setArrivalData] = useState(null);
    const [chartData, setChartData] = useState(null);

    const [dateStart, setDateStart] = useState(0);
    const [dateEnd, setDateEnd] = useState(undefined); //this will be set to the current date, on backend
    const [averageTimeSpent, setAverageTimeSpent] = useState(0);

    useEffect(() => {
        async function getArrivals() {
            //returns all arrivals for a user in a certain time period
            setIsLoading(true);
            await jwtInterceptor
                .post(
                    `${api_url}/arrival/get/${user.ID}`,
                    {
                        startDate: dateStart, //even if dateStart is 0, it will still work because endDate is hardcoded in the backend
                        endDate: dateEnd,
                    }, //represents arrival time of a user
                    {
                        withCredentials: true,
                    }
                )
                .then((res) => {
                    console.log("Arrival data postavljen:", res.data);
                    setArrivalData(res.data); //this data is used to create the chart
                })
                .catch((err) => {
                    console.log(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });


        }

        async function getClientsMembership() {
            //returns clients membership details
            setIsLoading(true);
            await jwtInterceptor
                .get(
                    `${api_url}/membership/${user.ID}`, //represents arrival time of a user
                    {
                        withCredentials: true,
                    }
                )
                .then((res) => {
                    console.log("Mem data postavljen:", res.data);
                    props.setMemberships(res.data);

                    //get employee details
                    res.data.forEach((memEl) => {
                        //TESTIRATI OVAJ DIO SA NEKIM KO JE NA PERSONALNI TRENING ILI GRUPNI
                        if (memEl.FK_EmployeeID !== null) {
                            jwtInterceptor
                                .get(
                                    `${api_url}/employee/${memEl.FK_EmployeeID}`, //represents arrival time of a user
                                    {
                                        withCredentials: true,
                                    }
                                )
                                .then((res) => {
                                    console.log("Employee data postavljen:", res.data);
                                })
                                .catch((err) => {
                                    console.log(err);
                                })
                                .finally(() => {
                                    setIsLoading(false);
                                });

                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                }).finally(() => {
                    setIsLoading(false);
                });
        }

        getClientsMembership();
        getArrivals();
    }, [user]);

    const handleAverageTimeSpent = (minutes) => {
        setAverageTimeSpent((prevTimeSpent) => prevTimeSpent + minutes);
    };

    useEffect(() => {
        if (!arrivalData || isLoading) return;
        //creating the chart
        setAverageTimeSpent(0); //resetting average time spent
        console.log("Arrival data:", arrivalData);
        setChartData({
            labels: arrivalData.map((arrData) => {
                //x-axis
                const day = new Date(arrData.ArrivalTime).getDate();
                const dayWithoutZeros = day.toString().replace(/^0+/, ""); // if a day is 01, it will be converted to 1

                return dayWithoutZeros;
            }),
            datasets: [
                {
                    label: "Time spent in gym (minutes)",
                    data: arrivalData.map((arrData) => {
                        //y-axis
                        //returns number of minutes spent in the gym
                        const arrivalTime = new Date(arrData.ArrivalTime);
                        if (arrData.DepartureTime === null) {
                            //This means that the user is still in the gym
                            return Math.round((new Date() - new Date(arrData.ArrivalTime)) / 60000);
                        }
                        const departureTime = new Date(arrData.DepartureTime);
                        const timeDifferenceInMilliseconds = departureTime - arrivalTime;

                        const minutesSpent = Math.round(timeDifferenceInMilliseconds / 60000);
                        handleAverageTimeSpent(minutesSpent);

                        return minutesSpent;
                    }),
                    backgroundColor: ["#a6e6bf"],
                    hoverBackgroundColor: ["#5be49b"],
                    borderColor: "#007867",
                    borderWidth: 0.7,
                },
            ],
        });
    }, [arrivalData, dateStart, dateEnd]);

    const handleStartDate = (date) => {
        const start = moment(date.$d).format("YYYY-MM-DD"); //this format is in dabatabase
        setDateStart(start);
    };

    const handleEndDate = (date) => {
        const end = moment(date.$d).format("YYYY-MM-DD"); //this format is in dabatabase
        setDateEnd(end);
    };


    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="attendance-container">
            <div className="title">
                <h2>Attendance</h2>
            </div>
            <div className="date-range">
                <div className="BasicDatePicker">
                    <BasicDatePicker
                        handleDateChange={handleStartDate}
                        label="Date Start"
                        disableFuture={true}
                        disablePast={false}
                    />
                </div>
                <div className="BasicDatePicker">
                    <BasicDatePicker
                        handleDateChange={handleEndDate}
                        label="Date End"
                        disableFuture={true}
                        disablePast={false}
                    />
                </div>
            </div>
            {/* Rendering chart */}
               {!isLoading && chartData && arrivalData &&
                    <div className="bar-chart-container">
                    <BarChart
                        chartData={chartData}
                        barPercentage={0.5} //bar width
                        labelX="Day of the Month"
                        labelY="Time spent (minutes)"
                        color={"#007867"} //color of the labels
                        font={{ size: "16" }} //font of the labels
                    />
                    <div className="average-time-spent">
                        <h4>
                            Average time spent in gym:{" "}
                            {averageTimeSpent / (!arrivalData ? 1 : arrivalData.length)}{" "}
                            minutes
                        </h4>
                    </div>
                </div>
                }
            
        </div>
    );
}

export default Attendance;
