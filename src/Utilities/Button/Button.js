import Button from "@mui/material/Button";

function ButtonIcon(props) {
    return (
        <Button
            style={props.style}
            endIcon={props.icon}
            onClick={props.handleClick}
            disabled={props.disabled}
            startIcon={props.startIcon}
            sx={props.sx}
        >
            {props.label}
        </Button>
    );
}

export default ButtonIcon;
