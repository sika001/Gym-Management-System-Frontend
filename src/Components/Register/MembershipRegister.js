import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ColorCheckbox from "../../Utilities/Checkbox/Checkbox";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Button from "@mui/material/Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useSnackbar } from "notistack";

function MembershipRegister(props) {
    const [workoutData, setWorkoutData] = useState([]); //workout programs are array of objects
    const [workout, setWorkout] = useState("");
    const [membershipTypeData, setMembershipTypeData] = useState([]); //membership types are array of objects
    const [membershipType, setMembershipType] = useState("");
    const [checked, setChecked] = useState(false);
    const [coaches, setCoachesData] = useState([]);
    const [coach, setCoach] = useState("");
    const [FK_ClientID, setFK_ClientID] = useState("");

    const [isBluredWrkt, setIsBluredWrkt] = useState(false); //state that tracks when a form is out of focus
    const [isBluredMem, setIsBluredMem] = useState(false); //state that tracks when a form is out of focus
    const [isBluredCoach, setIsBluredCoach] = useState(false); //state that tracks when a form is out of focus

    //data to /register is being sent over FormData, beacuse of the file upload
    const [registerFormData, setRegisterFormData] = useState(null); //object that will be sent to the database

    const { enqueueSnackbar } = useSnackbar(); //this is used for displaying a snackbar message
    const showSnackbarMessage = (variant, message) => () => {
        // variant could be success, error, warning, info, or default
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar position
        });
    };

    useEffect(() => {
        if (registerFormData) return;

        const registerFD = new FormData();
        //append client and role data to registerFormData
        registerFD.append("Name", props.client.get("Name"));
        registerFD.append("Surname", props.client.get("Surname"));
        registerFD.append("DateOfBirth", props.client.get("DateOfBirth"));
        registerFD.append("Address", props.client.get("Address"));
        registerFD.append("City", props.client.get("City"));
        registerFD.append("Country", props.client.get("Country"));
        registerFD.append("Phone", props.client.get("Phone"));
        registerFD.append("Picture", props.client.get("Picture"));
        registerFD.append("PictureName", props.client.get("PictureName"));

        registerFD.append("Email", props.role.get("Email"));
        registerFD.append("Password", props.role.get("Password"));

        //registerFormData now contains client and role data from previous steps

        console.log("REGISTER FORM DATA NA STARTU: ", ...registerFD);

        setRegisterFormData(registerFD);
    }, []);

    const [isSubmitted, setIsSubmitted] = useState(false); //state that tracks when a form is submitted
    const [successClient, setSuccessClient] = useState(false); //state that tracks when a client is added to the database

    const navigate = useNavigate();

    useEffect(() => {
        const getWorkoutProgramsData = axios
            .get(`${api_url}/workout`)
            .then((res) => setWorkoutData(res.data))
            .catch((err) => console.log("GRESKA WORKOUT", err));
    }, []);

    useEffect(() => {
        ///Added because of a bug when switching from "Individual Workout" to "Group Workout
        if (workout.Type !== "Individual Workout") setChecked(false);
    }, [workout]);

    const handleBlurWrkt = () => {
        setIsBluredWrkt(true);
    };

    const handleBlurMem = () => {
        setIsBluredMem(true);
    };
    const handleBlurCoach = () => {
        setIsBluredCoach(true);
    };

    const handleWorkoutChange = (event) => {
        setWorkout(event.target.value);
    };

    const api_url = process.env.REACT_APP_API_URL;    
    
    useEffect(() => {
        const getMembershipTypeData = axios
            .get(`${api_url}/membership-type/${props.gym.ID}`) //gets membership types for the corresponding gym
            .then((res) => {
                setMembershipTypeData(res.data.recordset);
            })
            .catch((err) => console.log(err));
    }, []);

    const handleMembershipTypeChange = (event) => {
        setMembershipType(event.target.value);
    };

    function handleCheckbox() {
        setChecked(!checked);
    }

    function handleCoachChange(event) {
        const selectedCoachID = event.target.value.ID;
        setCoach(event.target.value);
    }

    useEffect(() => {
        
        const getAllCoachesData = axios
            .get(`${api_url}/employee/type/1`) //employee/type/1 - are coaches
            .then((res) => {
                    console.log("GET ALL COACHES WORKOUTS: ", res.data);
                setCoachesData(res.data)})
            .catch((err) => console.log("GRESKA GET ALL COACHES", err));
    }, []);

    function handleMembership() {
        //Da bi izbjeli da ima više datuma i memshipID-ova u registerFormData (zbog appenda)
        //Tada, ako već postoji datum ili memshipID, obrišemo ga i dodamo novi
        if(registerFormData.has("StartDate")){
            registerFormData.delete("StartDate");
        }
        
        if(registerFormData.has("FK_MembershipTypeID")){
            registerFormData.delete("FK_MembershipTypeID");
        }
        registerFormData.append("StartDate", moment(new Date()).format("YYYY-MM-DD HH:mm:ss"));
        registerFormData.append("FK_MembershipTypeID", membershipType.ID);

        console.log("REGISTER FORM DATA SA MEMBERSHIP: ", ...registerFormData);
    }

    useEffect(() => {
        if (!isSubmitted) return;

            //sending form data to the backend
            console.log("REGISTER FORM DATA: ", ...registerFormData);
            const register = axios
                .post(`${api_url}/register`, registerFormData, {
                    headers: {
                        "Content-Type": "multipart/form-data", // Important: Set the content type to 'multipart/form-data'
                    },
                })
                .then((res) => {
                    //if successful, add Client ID to membership object,
                    console.log("Client added SUCCESSFULLY", res.data);
                    showSnackbarMessage("success", "Uspješna registracija!")();
                    setFK_ClientID(res.data.FK_ClientID); //this will be used to add FK_ClientID to membership object
                    setSuccessClient(true);
                })
                .catch((err) => {
                    console.log("ERROR while trying to register", err);
                    showSnackbarMessage("error", "Greška prilikom registracije!")()
                });

            setIsSubmitted(false); //reset state
    }, [isSubmitted]);

    const convertFormDataToJSON = (formData) => {
        let obj = {};
        for (let key of formData.keys()) {
            obj[key] = formData.get(key);
        }
        return obj;
    };

    useEffect(() => {
        if (!successClient) {
            return;
        }
        // console.log("TRYING TO ADD MEMBERSHIP DATA: SUCCESS CLIENT:", successClient);
        const currDateTime = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

        const membership = convertFormDataToJSON(registerFormData);
        //if successful, add Client ID to membership object,

        const membershipRes = axios
            .post(`${api_url}/membership`, {
                FK_ClientID: FK_ClientID, //this state is from registering a client (useEffect above)
                Status: 1,
                ...membership,
            })
            .then((res) => {
                console.log("Membership added", res.data);
                
                //make a transaction
                axios.post(`${api_url}/transaction`, {
                    Amount: checked
                        ? membershipType.Price + coach.EmployeePrice
                        : membershipType.Price,
                    Date: currDateTime,
                    FK_TransactionTypesID: 1, //1 - membership renewal
                    FK_ClientID: FK_ClientID,
                    FK_EmployeeID: null,
                    Description: `${registerFormData.get("Name")} ${registerFormData.get("Surname")} - Uplata članarine, tip: ${membershipType.Name}`
                })
                .then((res) => {
                    showSnackbarMessage("success", `Uspješno kupljena članarina!`)();
                    navigate("/login");
                })
                .catch((err) => {
                    showSnackbarMessage("error", "Greška prilikom kupovine članarine!")();
                    console.log("Error while trying to buy a membership", err);
                });
            })
            .catch((err) => {
                showSnackbarMessage("error", "Greška prilikom uplate članarine!")();
                console.log("ERROR while trying to register membership", err);
            });
            
            
            

        setSuccessClient(false); //reset state
    }, [successClient]);

    function handleSubmit(event) {
        console.log("SUBMIT PROSAO");
        setIsSubmitted(true);
        //useEffect hook above, will take take care of sending data to the database
    }

    useEffect(() => {
        if (workout.length === 0) return;

        handleClient();
    }, [workout]);

    useEffect(() => {
        if (membershipType.length === 0) return;

        handleMembership();
    }, [membershipType]);

    const [trigger, setTrigger] = useState(false); //used to trigger useEffect below, - used so that FK_WorkoutID is not overriden in handleClient function

    function replaceFK_WorkoutID() {
        //when a person chooses private coach, switches original workout, to the one with the corresoponding coach
        const selectedWorkout = workoutData.find(
            (workoutEl) =>
                workoutEl.FK_EmployeeID === coach.ID && workoutEl.Type === "Individual Workout"
        );

        if (selectedWorkout) {
            props.handleWorkout(selectedWorkout);

            if (!checked) {

                if(registerFormData.has("FK_WorkoutID")){
                    //da bi izbjegli duplanje FK_WorkoutID-a u registerFormData, obrišemo stari i postavimo novi
                    registerFormData.delete("FK_WorkoutID");
                }

                registerFormData.append("FK_WorkoutID", selectedWorkout.ID);
                console.log("REGISTER FORM DATA SA FK_WRKID REPLACE: ", ...registerFormData);
            }
        }
        setTrigger(false); //resets state
    }

    useEffect(() => {
        if (coach.length === 0) return;

        props.handlePersonalCoach(coach);

        if (checked) {
            replaceFK_WorkoutID(); //replaces FK_WorkoutID with the one that has the corresponding coach
            //trigger is used so that FK_WorkoutID is not ovveriden in handleClient function
        }
    }, [coach, trigger]);
    const handleClient = () => {
        props.handleClient({ ...props.client });

        if (!checked) {
            //if it is not a private coach, then we need to add FK_WorkoutID to registerFormData
            if(registerFormData.has("FK_WorkoutID")){
                //da bi izbjegli duplanje FK_WorkoutID-a u registerFormData, obrišemo stari i postavimo novi
                registerFormData.delete("FK_WorkoutID");
            }

            registerFormData.append("FK_WorkoutID", workout.ID);

        }
        console.log("REGISTER FORM DATA SA FK_WRKID: ", ...registerFormData);

        setTrigger(true);
    };

    let coachRendered = [];

    return (
        <>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                    value={workout || ""}
                    onChange={handleWorkoutChange}
                    displayEmpty
                    onBlur={handleBlurWrkt}
                    error={workout.length === 0 && isBluredWrkt}
                >
                    {workoutData.map((workoutEl) => {
                        if (
                            (workoutEl.Type === "Individual Workout" && !workoutEl.FK_EmployeeID) ||
                            workoutEl.Type === "Group Workout"
                        ) {
                            return (
                                // value is entire object
                                <MenuItem
                                    value={workoutEl}
                                    key={uuidv4()}
                                    onChange={handleCoachChange}
                                >
                                    <span>
                                        <b>{workoutEl.Name}</b> - ({workoutEl.Type})
                                        <br />
                                        {workoutEl.FK_EmployeeID &&
                                            coaches.map((coachEl) => {
                                                if (
                                                    coachEl.ID === workoutEl.FK_EmployeeID &&
                                                    !coachRendered[workoutEl.FK_EmployeeID] //same coach can be assigned to multiple workouts, so we need to check if he is already rendered
                                                ) {
                                                    coachRendered[workoutEl.FK_EmployeeID] = 1;

                                                    return (
                                                        "Coach: " +
                                                        coachEl.Name +
                                                        " " +
                                                        coachEl.Surname
                                                    );
                                                }
                                            })}
                                    </span>
                                </MenuItem>
                            );
                        }
                        return null;
                    })}
                </Select>
                <FormHelperText>Odaberi trening</FormHelperText>
                {workout.Type === "Individual Workout" && (
                    <ColorCheckbox //renders only if workout is individual
                        handleCheckbox={handleCheckbox}
                        labelMessage="Unajmi personalnog trenera!"
                    />
                )}
            </FormControl>

            {/* Ako korisnik odabere indiviaulni trener i zatraži personalnog trenera ovo renderuj */}
            {checked && workout.Type === "Individual Workout" && (
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                        value={coach || ""}
                        onChange={handleCoachChange}
                        displayEmpty
                        onBlur={handleBlurCoach}
                        error={coach.length === 0 && isBluredCoach}
                    >
                        {/* Renderuje samo trenere koji vode individualne treninge*/}
                        {coaches.map((coachEl) =>
                            coachEl["Workout Name"] === "Individual Workout" ? (
                                <MenuItem value={coachEl} key={uuidv4()}>
                                    <div key={uuidv4()}>
                                        {coachEl.Name} {coachEl.Surname} - {coachEl.EmployeePrice}€
                                    </div>
                                </MenuItem>
                            ) : null
                        )}
                    </Select>
                    <FormHelperText>Odaberi trenera</FormHelperText>
                </FormControl>
            )}

            <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                    value={membershipType || ""} //|| "" is added so that the state is controlled
                    onChange={handleMembershipTypeChange}
                    displayEmpty
                    onBlur={handleBlurMem}
                    error={membershipType.length === 0 && isBluredMem}
                >
                    {membershipTypeData.map((membershipEl) => (
                        <MenuItem value={membershipEl} key={uuidv4()}>
                            {membershipEl.Name} - {membershipEl.Price}€
                        </MenuItem>
                    ))}
                </Select>
                <FormHelperText>Odaberi članarinu!</FormHelperText>
            </FormControl>

            <div className="total">
                <hr />
                <h2>
                    Ukupna cijena:{" "}
                    {checked ? membershipType.Price + coach.EmployeePrice : membershipType.Price}€
                </h2>
            </div>

            <div className="submit">
                <Button
                    className="submit-btn"
                    variant="outlined"
                    size="large" //-2 because steps starts at 0, and on the last step should be submit
                    onClick={handleSubmit}
                    type="submit" //needed for file upload to work
                    disabled={
                        checked
                            ? workout.length === 0 ||
                              coach.length === 0 ||
                              membershipType.length === 0
                            : workout.length === 0 || membershipType.length === 0
                    }
                >
                    Napravi nalog
                </Button>
            </div>
        </>
    );
}

export default MembershipRegister;
