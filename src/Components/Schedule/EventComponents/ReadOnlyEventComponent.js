import React from "react";
import moment from "moment";
import { Box } from "@mui/material";
import scheduleIcon from "../../../images/schedule.png";
import coachIcon from "../../../images/coach.png";

function ReadOnlyEventComponent({ 
                                popoverStartDate, 
                                popoverEndDate, 
                                popoverCoach, 
                                popoverWorkoutName,
                                popoverWorkoutType,
                                }) {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", fontSize: '18px', 
                    padding: '20px', border: '1px solid #E0E0E0', borderRadius: '5px'
                }}
        >

            <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <img
                    src={scheduleIcon}
                    style={{ width: "40px", height: "40px", marginRight: "5px" }}
                    alt="schedule icon"
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Box fontWeight="bold">
                        { moment(popoverStartDate).format("DD MMM YYYY") + " - " + moment(popoverEndDate).format("DD MMM YYYY")}
                    </Box>
                    <Box fontSize="14px">
                        ({ moment(popoverStartDate).format("HH:mm") + "h" + " - " + moment(popoverEndDate).format("HH:mm") + "h" })
                    </Box>
                </Box>

            </Box>

            {popoverCoach &&
                <Box sx={{ display: "flex", flexDirection: "row", mt: 2.5 }}>
                    <img src={coachIcon} 
                        style={{width: '40px', height:'40px', marginRight: '5px'}}
                        alt="coach icon" 
                    />
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Box fontWeight="bold">
                            {popoverCoach} 
                        </Box>
                        <Box fontSize="small">
                            (Trener)
                        </Box>
                    </Box>

                        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 2}}>
                            {popoverWorkoutName &&
                                <Box fontWeight="bold">
                                    {popoverWorkoutName}
                                </Box>
                            }
                            {popoverWorkoutType &&
                                <Box fontSize="small">
                                 ({ popoverWorkoutType })
                                </Box>
                            }
                        </Box>
                    

                </Box>
            }

        </Box>
    );
}

export default ReadOnlyEventComponent;
