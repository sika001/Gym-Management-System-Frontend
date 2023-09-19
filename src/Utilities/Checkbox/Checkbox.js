import * as React from "react";
import { green } from "@mui/material/colors";
import Checkbox from "@mui/material/Checkbox";

function ColorCheckbox(props) {
    return (
        <div>
            <Checkbox
                onChange={props.handleCheckbox}
                id="checkbox"
                sx={{
                    color: green[300],
                    "&.Mui-checked": {
                        color: green[600],
                    },
                }}
                defaultChecked={props.defaultChecked}
            />
            <label htmlFor="checkbox">{props.labelMessage}</label>
        </div>
    );
}

export default ColorCheckbox;
