import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import ColorCheckbox from "../../Utilities/Checkbox/Checkbox";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Button from "@mui/material/Button";
import environment from "../../environment";
import axios from "axios";

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

    const [registerObject, setRegisterObject] = useState({
        ...props.client, //client object from parent component
        Email: props.role.Email, //for role table
        Password: props.role.Password,
    }); //object that will be sent to the database

    const [isSubmitted, setIsSubmitted] = useState(false); //state that tracks when a form is submitted
    const [successClient, setSuccessClient] = useState(false); //state that tracks when a client is added to the database

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

    const api_url = environment.api_url;
    useEffect(() => {
        const getMembershipTypeData = axios
            .get(`${api_url}/membership-type`)
            .then((res) => {
                setMembershipTypeData(res.data.recordset);
            })
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        console.log("Membership Type", membershipType);
    }, [membershipType]);

    const handleMembershipTypeChange = (event) => {
        setMembershipType(event.target.value);
    };

    function handleCheckbox() {
        setChecked(!checked);
    }

    function handleCoachChange(event) {
        console.log("COACH", event.target.value);
        const selectedCoachID = event.target.value.ID;
        setCoach(event.target.value);
    }

    useEffect(() => {
        const getAllCoachesData = axios
            .get(`${api_url}/employee/type/1`) //employee/type/1 - are coaches
            .then((res) => setCoachesData(res.data))
            .catch((err) => console.log("GRESKA GET ALL COACHES", err));
    }, []);

    function handleMembership() {
        const membership = {
            // Status: membershipType.Status, //Status or Valid (STA TREBA)
            StartDate: new Date(),
            FK_MembershipTypeID: membershipType.ID,
        };

        setRegisterObject((registerObject) => ({ ...registerObject, ...membership })); //prev value is spreaded, and new value is added
        props.handleMembership(membership);
    }

    useEffect(() => {
        console.log("SUBMIT USEEFFECT", isSubmitted);
        if (!isSubmitted) return;

        const register = axios
            .post(`${api_url}/register`, registerObject)
            .then((res) => {
                //if successful, add Client ID to membership object,
                console.log("Client added SUCCESSFULLY", res.data);

                setFK_ClientID(res.data.rolePerson.FK_ClientID); //this will be used to add FK_ClientID to membership object
                setSuccessClient(true);
            })
            .catch((err) => console.log("ERROR while trying to register", err));

        setIsSubmitted(false); //reset state
    }, [isSubmitted]);

    useEffect(() => {
        if (!successClient) return;

        console.log("TRYING TO ADD MEMBERSHIP DATA: SUCCESS CLIENT:", successClient);
        // handleMembership(); //sends membership object to parent component
        // if (checked) {
        //     setRegisterObject((registerObject) => ({ ...registerObject, FK_EmployeeID: coach.ID })); //prev value is spreaded, and new value is added
        // }
        //if successful, add Client ID to membership object,
        const membershipRes = axios
            .post(`${api_url}/membership`, {
                FK_ClientID: FK_ClientID, //this state is from registering a client (useEffect above)
                Status: 1,
                ...registerObject,
            })
            .then((res) => console.log("Membership added", res.data))
            .catch((err) => console.log("ERROR while trying to register membership", err));
        //dont need to spread entire registerObject, only need membership details

        setSuccessClient(false); //reset state
    }, [successClient]);

    function handleSubmit() {
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

    const [coachPrice, setCoachPrice] = useState(0);

    function replaceFK_WorkoutID() {
        //when a person chooses private coach, switches original workout, to the one with the corresoponding coach
        const selectedWorkout = workoutData.find(
            (workoutEl) =>
                workoutEl.FK_EmployeeID === coach.ID && workoutEl.Type === "Individual Workout"
        );

        if (selectedWorkout) {
            props.handleWorkout(selectedWorkout);
            setRegisterObject((registerObject) => {
                return {
                    ...registerObject,
                    FK_WorkoutID: selectedWorkout.ID,
                };
            });
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

        setRegisterObject((registerObject) => ({
            ...registerObject,
            ...props.client,
            FK_WorkoutID: !checked ? workout.ID : null,
            //if it's not checked, that means it's a group workout, so we need to add FK_WorkoutID, otherwise replaceFK_WorkoutID will take care of it
        }));

        setTrigger(true);
        console.log("HANDLE CLIENT PROBAO, REGISTER OBJECT: ", registerObject);
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
                <FormHelperText>Choose a Workout Program</FormHelperText>
                {workout.Type === "Individual Workout" && (
                    <ColorCheckbox //renders only if workout is individual
                        handleCheckbox={handleCheckbox}
                        labelMessage="Get a specialized coach!"
                    />
                )}
            </FormControl>
            {checked && workout.Type === "Individual Workout" && (
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                        value={coach || ""}
                        onChange={handleCoachChange}
                        displayEmpty
                        onBlur={handleBlurCoach}
                        error={coach.length === 0 && isBluredCoach}
                    >
                        {/* Renders an array of coaches */}
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
                    <FormHelperText>Choose a Professional</FormHelperText>
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
                <FormHelperText>Choose a Membership</FormHelperText>
            </FormControl>

            <div className="total">
                <hr />
                <h2>
                    Total price:{" "}
                    {checked ? membershipType.Price + coach.EmployeePrice : membershipType.Price}€
                </h2>
            </div>

            <div className="submit">
                <Button
                    className="submit-btn"
                    variant="outlined"
                    size="large" //-2 because steps starts at 0, and on the last step should be submit
                    onClick={handleSubmit}
                    disabled={
                        checked
                            ? workout.length === 0 ||
                              coach.length === 0 ||
                              membershipType.length === 0
                            : workout.length === 0 || membershipType.length === 0
                    }
                >
                    Submit
                </Button>
            </div>
        </>
    );
}

export default MembershipRegister;
