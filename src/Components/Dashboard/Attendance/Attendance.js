import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../../Auth Context/AuthContext";
import jwtInterceptor from "../../../Utilities/Interceptors/jwtInterceptor";
import { BarChart } from "../../../Utilities/Charts/Charts";
import moment from "moment";
import { BasicDatePicker } from "../../../Utilities/DatePickers/datepickers";
import Loader from "../../../Utilities/Loader/Loader";
import { Box, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";


function Attendance(props) {
    const { user } = useContext(AuthContext);
    const api_url = process.env.REACT_APP_API_URL;

    const [arrivalData, setArrivalData] = useState(null);
    const [chartData, setChartData] = useState(null);

    const [dateStart, setDateStart] = useState(0); //PROVJERITI DA LI JE OVO OK
    const [dateEnd, setDateEnd] = useState(undefined); //this will be set to the current date, on backend
    const [averageTimeSpent, setAverageTimeSpent] = useState(0);

    const theme = useTheme();

    useEffect(() => {
        async function getArrivals() {
            //returns all arrivals for a user in a certain time period
            const url = user.isClient === 0 ? `${api_url}/arrival/get/all` : `${api_url}/arrival/get`;
            console.log("Start date:", dateStart, "End date:", dateEnd);
            await jwtInterceptor
                .post(
                    `${url}/${user.ID}`, //u zavisnosti od toga da li je admin ili ne, dobijaju se razliciti podaci
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

        }

        async function getClientsMembership() {
            //returns clients membership details
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

                        }
                    });
                })
                .catch((err) => {
                    console.log(err);
                })
        }

        getClientsMembership();
        getArrivals();
    }, [user, dateStart, dateEnd, props.memBought]);

    const handleAverageTimeSpent = (minutes) => {
        setAverageTimeSpent((prevTimeSpent) => prevTimeSpent + minutes);
    };

    useEffect(() => {
        if (!arrivalData) return; 
        //creating the chart
        setAverageTimeSpent(0); //resetting average time spent
        console.log("Arrival data:", arrivalData);
        setChartData({
            labels: arrivalData.map((arrData) => {
                        //x-axis
                        const day = new Date(arrData.Day).getDate();

                        return day;
                    }),
            datasets: [
                {
                    label: "Vrijeme provedeno u teretani (minuti)",
                    data: arrivalData.map((arrData) => {
                            const avgTime = arrData.TotalTimeInMinutes
                            handleAverageTimeSpent(avgTime); // za izracunavanje prosječnog vremena

                            return avgTime;
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
        console.log("Start date change:", start);
        setDateStart(start);
    };

    const handleEndDate = (date) => {
        const end = moment(date.$d).format("YYYY-MM-DD"); //this format is in dabatabase
        console.log("End date change:", end);
        setDateEnd(end);
    };


    return (
        <Box  className="attendance-container"  
            sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', 
                border: '1px solid #E0E0E0', borderRadius: '10px',
                boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.2)',
            }}
        >
            <Typography variant="h4" sx={{m: 3, ...theme.title}} >
                Prisustvo
            </Typography>            
        

            <Box className="date-range" sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%', mb:3}}>
                <Box className="BasicDatePicker">
                    <BasicDatePicker
                        handleDateChange={handleStartDate}
                        label="Početni datum"
                        disableFuture={true}
                        disablePast={false}
                    />
                </Box>
                <Box className="BasicDatePicker">
                    <BasicDatePicker
                        handleDateChange={handleEndDate}
                        label="Krajnji datum"
                        disableFuture={true}
                        disablePast={false}
                    />
                </Box>
            </Box>
            {/* Renderovanje chart-a za posjetu */}
            {chartData && arrivalData && 
                <Box className="bar-chart-container"
                    sx={{display: 'flex', flexDirection: 'column', alignItems: 'center',
                     width: '60vw', height: '50vh', mb: 5}}
                >
                    <BarChart
                        chartData={chartData}
                        barPercentage={0.5} //širina linije
                        labelX="Dani u mjesecu"
                        labelY="Vrijeme (minuti)"
                        color={"#007867"} //boja labela
                        font={{ size: "16" }} //font labele
                    />
                    <Box className="average-time-spent">
                        <Typography variant="p" sx={{fontSize: 15}}>
                            Prosječno vrijeme provedeno u teretani:{" "}
                            {Math.round(averageTimeSpent / (arrivalData.length || 1))} minuta
                        </Typography>
                    </Box>
                </Box>
            }
            
        </Box>
    );
}

export default Attendance;
