import * as React from "react";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers";

export function BasicDatePicker(props) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}> 
            <DatePicker
                onChange={props.handleDateChange}
                sx={props.sx}
                // style={props.style}
                value={props.date}
                format="DD-MM-YYYY"
                label={props.label}
                className={props.className}
                disableFuture={props.disableFuture}
                disablePast={props.disablePast}
                disabled={props.disabled}
            />
        </LocalizationProvider>
    );
}

export default function DateTimePickerComponent(props) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                className={props.className}
                onChange={props.handleDateTimeChange}
                format="DD-MM-YYYY HH:mm"
                label={props.label}
                defaultValue={props.defaultValue}
                disableFuture={props.disableFuture}
                disablePast={props.disablePast}
                sx={props.sx}
            />
        </LocalizationProvider>
    );
}
