import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import ButtonIcon from "../Button/Button";

const Transition = React.forwardRef(function Transition(props, ref) {
    //transition animation
    return <Slide direction="up" ref={ref} {...props} />;
});

function DialogComponent(props) {
    return (
        <div>
            {props.showButton && (
                <ButtonIcon
                    style={props.style}
                    label={props.label}
                    icon={props.icon}
                    handleClick={props.handleDialogOpen}
                    disabled={props.disabled}
                />
            )}
            <Dialog
                open={props.isDialogOpened}
                TransitionComponent={Transition}
                keepMounted
                onClose={props.handleDialogClose}
                aria-describedby="alert-dialog-slide-description"
                onBlur={props.handleBlur}
            >
                <DialogTitle>{props.dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {props.dialogText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.handleDialogClose} disabled={props.disableDisagreeBtn}>
                        {props.disagree}
                    </Button>
                    <Button onClick={props.handleAgree} disabled={props.disableAgreeBtn}>
                        {props.agree}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DialogComponent;
