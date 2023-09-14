import Button from "@mui/material/Button";

function ButtonIcon(props) {
    return (
        <Button
            style={props.style}
            endIcon={props.icon}
            onClick={props.handleClick}
            disabled={props.disabled}
            startIcon={props.startIcon}
        >
            {props.label}
        </Button>
    );
}

export default ButtonIcon;
