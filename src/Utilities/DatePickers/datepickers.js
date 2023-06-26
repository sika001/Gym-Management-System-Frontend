import * as React from "react";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-time-picker";
import DateAdapter from "@mui/lab/AdapterMoment";
import Localization from "@mui/x-date-time-picker/src/localization/en";

function BasicDatepicker() {
    return (
        <LocalizationProvider dateAdapter={DateAdapter} localization={Localization}>
            <DateTimePicker
            // your DateTimePicker props here
            />
        </LocalizationProvider>
    );
}

export default BasicDatepicker;
