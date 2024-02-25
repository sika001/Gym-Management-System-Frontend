import { Button, FormControl } from "@mui/material";
import React, { useState } from "react";

function FileUpload(props) {
    const [hideSubmit] = useState(props.hideSubmit || false);

    const [isSubmitted, setIsSubmitted] = useState(false);

    console.log("props.route: ", props.route);
    console.log("props.hideSubmit: ", props.hideSubmit);

    const handleFileButtonClick = () => {
        document.getElementById("fileInput").click();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Add your form submission logic here
        console.log("File uploaded");
    };

    return (
        <>
            {/* DON'T TOUCH encType */}

            <form method="POST" action={`${props.route}`} encType="multipart/form-data">
                {/* <input type="file" name="Picture" /> */}
                {/* <Button variant="contained" component="label" /> */}

                {/* Hidden file input */}
                <input type="file" id="fileInput" name="Picture" style={{ display: "none" }} />

                {/* Button to trigger file input */}
                <Button variant="contained" onClick={handleFileButtonClick}>
                    Select Files{" "}
                </Button>

                {/* <input type="submit" value="Upload" /> */}
                {!hideSubmit && (
                    <Button variant="contained" type="submit" onClick={handleSubmit}>
                        Upload
                    </Button>
                )}
            </form>
        </>
    );
}

export default FileUpload;
