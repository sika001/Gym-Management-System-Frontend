import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import DateTimePickerComponent from "../../../Utilities/DatePickers/datepickers";
import ColorCheckbox from "../../../Utilities/Checkbox/Checkbox";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import jwtInterceptor from "../../../Utilities/Interceptors/jwtInterceptor";
import { Box } from "@mui/material";
import moment from "moment";

function AddEditEventComponent({
    popoverText,
    popoverStartDate,
    popoverEndDate,
    isChecked,
    handleEditedEventNameChange,
    handleEditedEventStartDateChange,
    handleEditedEventEndDateChange,
    handleCheckbox,
    handleRecurringCheckbox,
    handleChosenElementChange,
    chosenElement,
    isBlured,
    handleBlur,
    popoverIsRecurring,
    isCreatingNewEvent,
}) {

    //Komponenta za kreiranje i editovanje događaja (Glavna logika u ScheduleComponent.js, ovo je samo da se rastereti malo kod)

    console.log("CHOSEN ELEMENT", chosenElement);
    const api_url = process.env.REACT_APP_API_URL;

    const [employeeWorkouts, setEmployeeWorkouts] = useState([]); //sadrži podatke o svim treninzima i njihovim trenerima (treba nam samo trening i ime trenera u suštini)
    
    useEffect(() => {
        jwtInterceptor.get(`${api_url}/employee/type/1`, { withCredentials: true })
                    .then((res) => {
                        console.log("Successfully fetched all employee workouts", res.data);
                        setEmployeeWorkouts(res.data);
                    })
                    .catch((err) => {
                        console.log("Error while fetching all workouts", err);
                    })
                    
                console.log("IS CREATING NEW EVENT", isCreatingNewEvent);
                console.log("POPOVER TEXT", popoverText, "length", popoverText.length);
                console.log("POPOVER START DATE", popoverStartDate, "length", popoverStartDate.length);
                console.log("POPOVER END DATE", popoverEndDate, "length", popoverEndDate.length);

                
    }, [])


    return (
        <Box sx={{display: 'flex', flexDirection: 'column', padding: '20px'}}> 
            <TextField
                label="Događaj"
                onChange={handleEditedEventNameChange}
                value={popoverText}
                onBlur={handleBlur}
                error={popoverText.length <= 1 && isBlured}
            />
            <DateTimePickerComponent
                label={"Odaberite datum početka"}
                defaultValue={isCreatingNewEvent ? null : dayjs(popoverStartDate)} //Prikazuje defaultnu vrijednost za datum, samo ako se edituje događaj
                handleDateTimeChange={handleEditedEventStartDateChange}
                disablePast={true}
                disableFuture={false}
                error={isCreatingNewEvent ? null : !popoverStartDate}
                sx={{mt: 3}}
            />
            <DateTimePickerComponent
                label={"Odaberite datum završetka"}
                defaultValue={isCreatingNewEvent ? null : dayjs(popoverEndDate)} //Prikazuje defaultnu vrijednost za datum, samo ako se edituje događaj (tad će postojati popoverText)
                handleDateTimeChange={handleEditedEventEndDateChange}
                disablePast={true}
                disableFuture={false}
                error={isCreatingNewEvent ?
                        (popoverStartDate && moment(popoverStartDate).isAfter(popoverEndDate))
                        :
                        !popoverEndDate || moment(popoverEndDate).isBefore(popoverStartDate) 
                     }
                sx={{mt: 3}}
            />
                <Box sx={{display: 'flex', flexDirection: 'row', mt: '15px'}}>
                    <ColorCheckbox labelMessage={"Dodijeli trening"} handleCheckbox={handleCheckbox} />
                    {isChecked && 
                        <ColorCheckbox
                            labelMessage={"Ponavlja se nedjeljno"}
                            defaultChecked={popoverIsRecurring}
                            handleCheckbox={handleRecurringCheckbox}
                        />
                    }
                </Box>
               
                {isChecked && (
                    <>
                        <Select value={chosenElement || ""} 
                                onChange={handleChosenElementChange} 
                                sx={{width: '100%'}}         
                                placeholder=""
                        >
                            {employeeWorkouts.map((employeeWorkout) => {
                                const workoutName = employeeWorkout["Workout Name"];
                                const workoutType = employeeWorkout["Workout Type"];
                                
                                const coach = employeeWorkout["Name"] + " " + employeeWorkout["Surname"];

                                return (
                                    // Renderuje se naziv treninga, tip treninga i trener 
                                    <MenuItem value={employeeWorkout} 
                                            key={uuidv4()} 
                                            sx={{display:'flex', flexDirection: 'row', justifyContent: 'space-evenly', border: '1px solid #e0e0e0', 
                                                borderRadius: '5px', p: 1, '&:hover': {backgroundColor: '#e0e0e0'}}}
                                    >
                                        {/* Renderuje naziv i tip treninga */}
                                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                            <Box component="div" fontWeight="bold">
                                                {workoutName}
                                            </Box>
                                            <Box component="div" fontSize="small">
                                                {workoutType && ( " (" + workoutType + ")" )}
                                            </Box>
                                        </Box>
                                        
                                        {/* Ako postoji trener (tj. ako ima više od 2 karaktera jer je " " u coach promjenljivoj ako nema trenera) */}
                                        {coach.length > 1 && 
                                            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 2}}>
                                                <Box>
                                                    {coach}
                                                </Box>
                                                <Box fontSize="small">
                                                    (Trener)
                                                </Box>
                                            </Box>
                                        }
                                                
                                    </MenuItem>
                                );
                                
                            })}
                        </Select>
                    </>
                )}
        </Box>
    );
}

export default AddEditEventComponent;
