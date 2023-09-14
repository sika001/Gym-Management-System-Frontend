import React, { useContext, useEffect } from "react";
import moment from "moment";
import { useState } from "react";
import "./MembershipInfo.css";
import renewalIcon from "../../../images/renewal (1).png";
import DialogComponent from "../../../Utilities/Dialog/Dialog";
import jwtInterceptor from "../../../Utilities/Interceptors/jwtInterceptor";
import AuthContext from "../../Auth Context/AuthContext";
import { useSnackbar } from "notistack";
import dotenv from 'dotenv';
dotenv.config();

function MembershipInfo(props) {

    const api_url = process.env.REACT_APP_API_URL;
    const { user } = useContext(AuthContext);

    const [isDialogOpened, setIsDialogOpen] = useState(false);
    const [isAgree, setIsAgree] = useState(false);

    const { enqueueSnackbar } = useSnackbar(); //this is used for displaying a snackbar message

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
                                Amount:
                                    props.memberships[0].Price +
                                    props.memberships[0]["Employee Price"],
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
        <div className="membership-container">
            <div className="title">
                <h2>Membership</h2>
            </div>

            <div className="membership-info-wrapper">
                {props.memberships.length !== 0 ? (
                    props.memberships.map((memEl, index) => (
                        <div key={memEl.ID} className="membership-info-container">
                            <div className="workout-container">
                                <h4>{memEl["Workout Name"]}</h4>
                                <h5>
                                    (Workout type will be here){" "}
                                    {memEl["FK_EmployeeID"] ? memEl["Workout Type"] : null}
                                </h5>
                            </div>
                            <div className="date-container">
                                <h4>Start Date: {moment(memEl.StartDate).format("DD-MM-YYYY")}</h4>
                                <h4>End Date: {moment(memEl.ExpiryDate).format("DD-MM-YYYY")} </h4>
                                <h5>
                                    {moment(memEl.ExpiryDate).diff(new Date(), "days") >= 0
                                        ? `Valid ${moment(memEl.ExpiryDate).diff(
                                              new Date(),
                                              "days"
                                          )}  more days!`
                                        : "Expired!"}
                                </h5>
                            </div>

                            <div className="membership-details-container">
                                <h4>
                                    Total price: {memEl.Price + memEl["Employee Price"]}€ /{" "}
                                    {memEl["Membership Type"]}
                                </h4>
                                {/* Renew button is displayed only on the latest memebership (if expired) */}
                                {index === 0 &&
                                //OVO PROMIJENITI
                                moment(memEl.ExpiryDate).diff(new Date(), "days") >= 0 ? (
                                    <DialogComponent
                                        label={"Renew"}
                                        disabled={true}
                                        icon={<img src={renewalIcon} style={{ width: "35px" }} />}
                                        style={{
                                            backgroundColor: "#cccccc",
                                            color: "#666666",
                                            border: "0px solid black",
                                        }}
                                        handleDialogOpen={handleDialogOpen}
                                        handleDialogClose={handleDialogClose}
                                        isDialogOpened={isDialogOpened}
                                        dialogTitle={"Renew membership"}
                                        dialogText={`Are you sure you want to renew your membership? You will be charged ${
                                            memEl.Price + memEl["Employee Price"]
                                        }€ for the renewal.`}
                                        disagree={"No"}
                                        agree={"Yes"}
                                        handleAgree={handleAgree}
                                        showButton={true}
                                    />
                                ) : (
                                    // if the membership is expired, display the renew button
                                    index === 0 && (
                                        <DialogComponent
                                            label={"Renew"}
                                            disabled={false}
                                            icon={
                                                <img src={renewalIcon} style={{ width: "35px" }} />
                                            }
                                            style={{
                                                backgroundColor: "rgba(17,141,87,255)",
                                                color: "white",
                                                border: "1px solid black",
                                            }}
                                            handleDialogOpen={handleDialogOpen}
                                            handleDialogClose={handleDialogClose}
                                            isDialogOpened={isDialogOpened}
                                            dialogTitle={"Renew membership"}
                                            dialogText={`Are you sure you want to renew your membership? You will be charged ${
                                                memEl.Price + memEl["Employee Price"]
                                            }€ for the renewal.`}
                                            disagree={"No"}
                                            agree={"Yes"}
                                            handleAgree={handleAgree}
                                            showButton={true}
                                        />
                                    )
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <h1>Loading...</h1>
                )}
            </div>
        </div>
    );
}

export default MembershipInfo;
