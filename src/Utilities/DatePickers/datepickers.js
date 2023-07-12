import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function BasicDatePicker(props) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                onChange={props.handleDateChange}
                value={props.date}
                format="DD-MM-YYYY"
                label={props.label}
                className={props.className}
            />
        </LocalizationProvider>
    );
}

export default BasicDatePicker;
