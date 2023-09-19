import React, { useContext, useEffect } from "react";
import moment from "moment";
import { useState } from "react";
import renewalIcon from "../../../images/renewal (1).png";
import DialogComponent from "../../../Utilities/Dialog/Dialog";
import jwtInterceptor from "../../../Utilities/Interceptors/jwtInterceptor";
import AuthContext from "../../Auth Context/AuthContext";
import { useSnackbar } from "notistack";
import Loader from "../../../Utilities/Loader/Loader";
import { Box } from "@mui/system";
import { Typography } from "@mui/material";
import { useTheme } from "@emotion/react";


function MembershipInfo(props) {

    const api_url = process.env.REACT_APP_API_URL;
    const { user } = useContext(AuthContext);

    const [isDialogOpened, setIsDialogOpen] = useState(false);
    const [isAgree, setIsAgree] = useState(false);

    const { enqueueSnackbar } = useSnackbar(); //this is used for displaying a snackbar message

    const theme = useTheme();

    const showSnackbarMessage = (variant, message) => () => {
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar position
        });
    };

    const handleDialogOpen = () => {
        console.log("Renewal button clicked");
        setIsDialogOpen(true);
        setIsAgree(false);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setIsAgree(false);
    };

    const handleAgree = () => {
        setIsDialogOpen(false);
        setIsAgree(true);
    };

    useEffect(() => {
        if (isAgree) {
            //This date will be used as a start date for the new membership, and as a date for the transaction (payment)
            const currDateTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            jwtInterceptor
                .post(
                    `${api_url}/membership`,
                    {
                        StartDate: currDateTime,
                        FK_ClientID: user.ID,
                        Status: 1,
                        FK_MembershipTypeID: props.memberships[0].FK_MembershipTypeID,
                    },
                    {
                        withCredentials: true,
                    }
                )
                .then((res) => {
                    //if the membership is successfully renewed, create a new transaction
                    jwtInterceptor
                        .post(
                            `${api_url}/transaction`,
                            {
                                Amount:props.memberships[0].Price + props.memberships[0]["Employee Price"],
                                Date: currDateTime,
                                FK_TransactionTypesID: 1, //1 - membership renewal
                                FK_ClientID: user.ID, //POSTAVITI USLOV DA SE OVO IZVUCE IZ COOKIE-a, ILI EMPLOYEEID AKO JE ZAPOSLENI
                                FK_EmployeeID: null, //OVO IZ COOKIE-a IZVUCI
                            },
                            {
                                withCredentials: true,
                            }
                        )
                        .then((res) => {
                            showSnackbarMessage("success", "Successfully renewed a membership")();
                        });
                })
                .catch((err) => {
                    showSnackbarMessage("error", "Error while trying to renew a membership")();
                });
        }
    }, [isAgree]);

    return (
        <Box sx={{mt: 4}}>
            <Box sx={{mt: 4, mb: 3, textAlign: 'center'}} >
                <Typography sx={{fontWeight: 'bold', fontSize: 30, color: theme.palette.primaryGreen.darkGreen}} > 
                    Podaci o članarini 
                </Typography>
            </Box>

            <Box sx={{border: `1px solid ${theme.palette.primaryGrey.light}`, borderRadius: 5, p: 3,
                        boxShadow: theme.boxShadows.primary}}>
                {props.memberships.length !== 0 ? (
                    props.memberships.map((memEl, index) => (

                        <Box key={memEl.ID}>

                            <Box sx={{display: 'flex', flexDirection: 'column', 
                                    borderBottom: `1px solid ${theme.palette.primaryGrey.light}`, p: 1 }}>
                               
                                <Typography sx={{fontSize: 22, fontWeight: 'bold', color: theme.palette.primaryGreen.darkGreen}}>
                                    {memEl["Workout Name"]}
                                </Typography>
                                {
                                    memEl["Workout Type"] &&
                                    <Typography sx={{fontSize: 16, fontStyle: 'italic', color: theme.palette.primaryGreen.darkGreen}}>
                                        {memEl["Workout Type"]}
                                    </Typography>
                                }
                            </Box>

                            <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: 5}}                            >
                                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}> 
                                    <Typography sx={{fontSize: 17, color: theme.palette.primaryGrey.darkGrey}}>
                                        Datum uplate
                                    </Typography>
                                    <Typography variant="h6" sx={{mt: 0.6}}>
                                        {moment(memEl.StartDate).format("DD-MMM-YYYY")}
                                    </Typography> 
                                </Box>
                                
                               <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    <Typography sx={{fontSize: 17, color: theme.palette.primaryGrey.darkGrey}}>
                                        Datum isteka
                                    </Typography>
                                    <Typography variant="h6">{moment(memEl.ExpiryDate).format("DD-MMM-YYYY")} </Typography>
                                    <Typography sx={{fontSize: 16, color: theme.palette.primaryGrey.darkGrey, mt: 0.6}}>
                                        {moment(memEl.ExpiryDate).diff(new Date(), "days") >= 0
                                            ? 
                                            `Validna još ${moment(memEl.ExpiryDate).diff(new Date(),"days")} dana!`
                                            : "Članarina je istekla!"}
                                    </Typography>
                                </Box>

                                <Box sx={{display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', }}>
                                    <Typography sx={{mt: 1, }}>
                                        Ukupna cijena: {memEl.Price + memEl["Employee Price"]}€ /{" "}
                                        {memEl["Membership Type"]}
                                    </Typography>
                                    {/* Dugme 'Obnovi' se prikazuje samo za posljednju članarinu (kad istekne) */}
                                    {index === 0 &&
                                        moment(memEl.ExpiryDate).diff(new Date(), "days") >= 0 
                                    ? (
                                        <DialogComponent
                                            label={"Obnovi"}
                                            disabled={true}
                                            icon={<img src={renewalIcon} style={{ width: "40px" }} />}
                                            style={{
                                                backgroundColor: theme.palette.primaryGrey.light,
                                                color: theme.palette.primaryGrey.darkGrey,
                                                border: `1px solid ${theme.palette.primaryGrey.light}`
                                            }}
                                            handleDialogOpen={handleDialogOpen}
                                            handleDialogClose={handleDialogClose}
                                            isDialogOpened={isDialogOpened}
                                            dialogTitle={"Obnovi članarinu"}
                                            dialogText={`Da li ste sigurni da želite da obnovite članarinu za '${memEl["Workout Name"]}', 
                                                        u iznosu od ${memEl.Price + memEl["Employee Price"]}€?
                                                        `}
                                            disagree={"Odustani"}
                                            agree={"Potvrdi"}
                                            handleAgree={handleAgree}
                                            showButton={true}
                                        />
                                    ) : (
                                        // ako je istekla članarina, prikazati dugme za obnovu
                                        index === 0 && (
                                            <DialogComponent
                                                label={"Obnovi"}
                                                disabled={false}
                                                icon={
                                                    <img src={renewalIcon} style={{ width: "35px" }} />
                                                }
                                                style={{
                                                    backgroundColor: "#008050",
                                                    color: "white",
                                                    border: `1px solid ${theme.palette.primaryGrey.light}`,
                                                }}
                                                handleDialogOpen={handleDialogOpen}
                                                handleDialogClose={handleDialogClose}
                                                isDialogOpened={isDialogOpened}
                                                dialogTitle={"Obnova članarine"}
                                                dialogText={`Da li ste sigurni da želite da obnovite članarinu za '${memEl["Workout Name"]}', 
                                                u iznosu od ${memEl.Price + memEl["Employee Price"]}€?`}
                                                disagree={"Odustani"}
                                                agree={"Potvrdi"}
                                                handleAgree={handleAgree}
                                                showButton={true}
                                            />
                                        )
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    ))
                ) : (
                    <Loader />
                )}
            </Box>
        </Box>
    );
}

export default MembershipInfo;
