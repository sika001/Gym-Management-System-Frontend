import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";

function HorizontalStepperWithError(props) {
    const isStepFailed = (step) => {
        return false;
    };
    // const handleClick = (event) => {
    //     console.log("CLICKED", event.target);
    // };
    // const [hover, setHover] = React.useState(false);
    return (
        <Box sx={{ width: "100%" }}>
            <Stepper activeStep={props.activeStep}>
                {props.steps.map((label, index) => {
                    const labelProps = {};
                    if (isStepFailed(index)) {
                        labelProps.optional = (
                            <Typography variant="caption" color="error">
                                {props.errorMessage}
                            </Typography>
                        );

                        labelProps.error = true;
                    }

                    return (
                        <Step
                            key={label}
                            // onClick={handleClick}
                            // onMouseEnter={() => setHover(true)}
                            // onMouseLeave={() => setHover(false)}
                            // style={
                            //     hover ? { cursor: "pointer", backgroundColor: "red" } : null
                            // }
                        >
                            <StepLabel {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
        </Box>
    );
}

export default HorizontalStepperWithError;
