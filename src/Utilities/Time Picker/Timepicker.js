import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

function Timepicker() {
    const [value, setValue] = React.useState();

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
                label="Choose time"
                value={value}
                onChange={(newValue) => setValue(newValue)}
            />
        </LocalizationProvider>
    );
}

export default Timepicker;
