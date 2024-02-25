import * as React from "react";
import { SnackbarProvider, useSnackbar } from "notistack";

export default function IntegrationNotistack(props) {
    //This function is invoked when calling a snackbar
    return (
        <SnackbarProvider maxSnack={3}>
            <Snackbar variant={props.variant} message={props.message} onClose={props.handleClose} />
        </SnackbarProvider>
    );
}

function Snackbar(props) {
    //IMPORTANT NOTE: SNACKBAR RUNS 2 TIMES BECAUSE OF THE STRICT MODE
    const { enqueueSnackbar } = useSnackbar();

    const handleClickVariant = (variant) => () => {
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(props.message, {
            variant,
            autoHideDuration: 2500,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar position
        });
    };

    React.useEffect(() => {
        //runs handleClickVarient function, which displays the snackbar depending on the variant
        handleClickVariant(props.variant)();
    }, []);

    return <></>; //don't need to return anything, because the snackbar is displayed in the handleClickVariant function
}
