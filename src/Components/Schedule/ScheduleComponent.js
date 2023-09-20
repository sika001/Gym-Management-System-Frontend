import React, { useContext, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { RRule } from "rrule";
import DialogComponent from "../../Utilities/Dialog/Dialog";
import moment from "moment";
import { useEffect } from "react";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import Loader from "../../Utilities/Loader/Loader";
import ReadOnlyEventComponent from "./EventComponents/ReadOnlyEventComponent";
import { Box, Typography } from "@mui/material";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import ButtonIcon from "../../Utilities/Button/Button";
import AddEditEventComponent from "./EventComponents/AddEditEventComponent";
import AuthContext from "../Auth Context/AuthContext";

function ScheduleComponent(props) {
    const [data] = useState(props.employeeWorkouts); //contains info about personal coaches, their workouts and time schedules

    const { user } = useContext(AuthContext)
    console.log("DATA", data);

    const [isLoading, setIsLoading] = useState(true);
    const [recurringEvents, setRecurringEvents] = useState([]); //contains info about recurring events
    const [nonRecurringEvents, setNonRecurringEvents] = useState([]); //contains info about non-recurring events

    const api_url = process.env.REACT_APP_API_URL;

    const changeDatesTime = (oldDate, newTime, decrementHour = 3600000) => {
        //return a new date with the same date as the old date, but with the time from the new time
        //NEW TIME IS ONE HOUR EARLIER THAN THE OLD TIME (BECAUSE OF THE TIME ZONE)
        const date = new Date(oldDate);
        const startTime = new Date(newTime).getTime() - decrementHour; //3600000 is 1 hour in milliseconds

        // Convert the startTime timestamp to a Date object
        const startTimeDate = new Date(startTime);

        // Create a new Date object with the adjusted date and time
        const newStartDate = new Date(date);
        newStartDate.setHours(startTimeDate.getHours());
        newStartDate.setMinutes(startTimeDate.getMinutes());
        newStartDate.setSeconds(startTimeDate.getSeconds());

        return newStartDate;
    };

    useEffect(() => {
        setIsLoading(true);
        //loading events from the database
        console.log("DATA DOVUCEN", data);

        data.forEach((element) => {
            //Isolates the start time from the date (because by default date is set to 1970-01-01)
            //in database, elemtent["StartTime"] is in format "2021-08-15T10:00:00" (YYYY-MM-DDTHH:mm:ss) (time(7))
            if (!element["isRecurring"]) {
                //if the event is non-recurring, it is added to the non-recurring events array
                console.log("NON RECURRING EVENT FOUND", element);

                const newStartDate = changeDatesTime(element["StartDate"], element["StartTime"]);
                const newEndDate = changeDatesTime(element["StartDate"], element["EndTime"]);
                // Now newStartDate holds the date with the adjusted time

                console.log("ELEMENT", element, "getDay", newStartDate.getDay(), "newEndDate", newEndDate);
                // console.log("newStartDate", newStartDate, "newEndDate", newEndDate);
                // console.log("NewStartDay", newStartDate.getDay());
                //updating the state of loaded non-recurring events
                setNonRecurringEvents((prev) => [
                    ...prev,
                    {
                        title: element["EventName"]
                            ? element["EventName"]
                            : element["Workout Name"], //this is used to display the workout name in the dialog
                        start: newStartDate,
                        end: newEndDate,
                        extendedProps: {
                            coach:
                                element["Name"] && element["Surname"]
                                    ? element["Name"] + " " + element["Surname"]
                                    : null, //this is used to display the coach name in the dialog
                            ScheduleID: element["ScheduleID"],
                            //OVO PROVJERITI
                            "Workout Name": element["Workout Name"],
                            "Workout Type": element["Workout Type"],
                            "FK_WorkoutID": element["FK_WorkoutID"],
                            "isRecurring": element["isRecurring"],
                        },
                    },
                ]);

                return;
            }
            // console.log("RECURRING EVENT FOUND", element);

            console.log("element[StartDate]", element["StartDate"]);
            console.log("element[StartTime]", element["StartTime"]);
            console.log("element[EndTime]", element["EndTime"]);
            const newStartDate = changeDatesTime(element["StartDate"], element["StartTime"]);
            const newEndDate = changeDatesTime(element["StartDate"], element["EndTime"]);

            console.log(
                "RECCURRING Element:",
                element,
                "newStartDate",
                newStartDate,
                "newEndDate",
                newEndDate
            );

            const RRuleDayMapping = { 0: 'SU', 1: 'MO', 2:'TU', 3:'WE', 4: 'TH', 5: 'FR', 6: 'SA'}; //Ovo je potrebno za RRule

            //updating the state of loaded recurring events
            setRecurringEvents((prev) => [
                ...prev,
                ///NAPRAVITI RECURRING DATES DA RADI; ZEZNUO SAM START I END DATEOVE, POGLEDATI I StartDate jer sam i to postavio za sve evente
                {
                    //this format is required by FullCalendar to display recurring events
                    title: element["EventName"] ? element["EventName"] : element["Workout Name"], //this is used to display the workout name in the dialog
                    start: newStartDate,
                    end: newEndDate,
                    extendedProps: {
                        coach:
                            element["Name"] && element["Surname"]
                                ? element["Name"] + " " + element["Surname"]
                                : null, //koristi se za prikaz imena trenera u Dialog komponenti
                        ScheduleID: element["ScheduleID"],
                        //OVO PROVJERITI
                        "Workout Name": element["Workout Name"],
                        "Workout Type": element["Workout Type"],
                        "FK_WorkoutID": element["FK_WorkoutID"],
                        "isRecurring": element["isRecurring"],
                    },
                    rrule: new RRule({
                        //u bazi je (0 - Sun, 1 - Mon,..., 5 - Fri, 6 - Sat)
                        //u RRule-u je (0 - Mon, 1 - Tue,..., 5 - Sat, 6 - Sun) PROVJERITI OVO
                        // byweekday: , //Od ovog dana u nedjelji počinje ponavljanje događaja
                        freq: RRule.WEEKLY,
                        byweekday: RRuleDayMapping[element["DayOfWeek"]], //Od ovog dana u nedjelji počinje ponavljanje događaja
                        //RRuleDayMapping je definisan gore; izvlačimo DayOfWeek iz baze i tražimo odgovarajući ekvivalent u RRulleDayMapping-u
                        dtstart: newStartDate,
                        until: new Date(new Date().getFullYear(), 11, 31), //ponavlja se do ovog datuma (31.12.trenutne godine) (od 0 počinju pa je 11 - Decembar)
                    }),
                },
            ]);
        });

        props.handleSetFetchData(false); //reset fetchData to false
    }, [data]);

    const [newPopoverText, setNewPopoverText] = useState(""); //contains info about the new popover text when an event is created
    const [isCreatingNewEvent, setIsCreatingNewEvent] = useState(false);

    const handleNewEventNameChange = (event) => {
        //handles the change of the new event
        console.log("NEW EVENT NAME", event.target.value);
        setNewPopoverText(event.target.value);
    };

    const handleNewEventCreate = () => {
        setIsCreatingNewEvent(true);

        handleDialogOpen(); //opens the dialog for adding a new event
    };

    const businessHours = {
        daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // All days of the week
        startTime: "08:00", // 8 AM
        endTime: "22:00", // 10 PM
    };

    //initial state is a blank space, beacuse a dialog component requires title and text in order to be rendered
    const [popoverText, setPopoverText] = useState(" "); // State to manage popover text
    const [popoverStartDate, setPopoverStartDate] = useState(" "); // State to manage popover start date
    const [popoverEndDate, setPopoverEndDate] = useState(" "); // State to manage popover end date
    const [popoverCoach, setPopoverCoach] = useState(" "); // State to manage popover coach name and surname
    const [popoverScheduleID, setPopoverScheduleID] = useState(-1); // State to manage popover schedule id
    const [popoverWorkoutName, setPopoverWorkoutName] = useState(" "); // State to manage popover workout name
    const [popoverWorkoutType, setPopoverWorkoutType] = useState(" "); // State to manage popover workout type
    const [popoverFK_WorkoutID, setPopoverFK_WorkoutID] = useState(-1); // State to manage popover workout id
    const [popoverIsRecurring, setPopoverIsRecurring] = useState(false); // State to manage popover isRecurring

    const handleEventMouseEnter = (arg) => {
        //handles the event mouse enter (when the user clicks on an event)
        //used to display the dialog with event info
        //sets event name, start and end date into a state
        setIsReadOnlyEvent(true);
        console.log("EVENT", arg.event);

        setPopoverStartDate(arg.event.startStr); //startStr is the start date of the event
        setPopoverEndDate(arg.event.endStr); //endStr is the end date of the event
        // setPopoverStartDate(arg.event.start);
        // setPopoverEndDate(arg.event.end); //VRATITI OVO GORE AKO NE BUDE RADILo
        console.log("POPOVER props", arg.event.extendedProps);
        setPopoverText(arg.event.title); // Set popover text on event mouse enter
        setPopoverCoach(arg.event.extendedProps.coach); //sets coach name and surname into a state
        setPopoverScheduleID(arg.event.extendedProps.ScheduleID); //sets schedule id into a state

        setPopoverWorkoutName(arg.event.extendedProps["Workout Name"]);
        setPopoverWorkoutType(arg.event.extendedProps["Workout Type"]);
        setPopoverFK_WorkoutID(arg.event.extendedProps["FK_WorkoutID"]);
        setPopoverIsRecurring(arg.event.extendedProps["isRecurring"]);

        handleDialogOpen(); //opens Dialog
    };

    const [isDialogOpened, setIsDialogOpen] = useState(false);
    const [isAgree, setIsAgree] = useState(false);

    const [isBlured, setIsBlured] = useState(false); //state that tracks when a form is out of focus
    const [startEventDate, setStartEventDate] = useState(""); //state that tracks the start date of the event
    const [endEventDate, setEndEventDate] = useState(""); //state that tracks the end date of the event
    const [isChecked, setIsChecked] = useState(false); //state that tracks if the checkbox is checked

    const resetNewEventStates = () => {
        //reseting the states
        setNewPopoverText(" ");
        setStartEventDate("");
        setEndEventDate("");
        setIsDialogOpen(false);
        setIsAgree(false);
        setIsChecked(false);
        setIsRecurring(false);
        setChosenElement(null);
        setIsReadOnlyEvent(false);
        setIsEditingEvent(false);
        setIsUpdated(false);

        setPopoverScheduleID(-1);
        setPopoverStartDate(" "); //startStr is the start date of the event
        setPopoverEndDate(" "); //endStr is the end date of the event
        setPopoverText(" "); // Set popover text on event mouse enter
        setPopoverCoach(" "); //sets coach name and surname into a stat

        // setIsLoading(false);
    };

    const handleEditedEventNameChange = (event) => {
        //handles the change of the edited event
        console.log("EDITED EVENT NAME", event.target.value);
        setPopoverText(event.target.value);
    };

    const handleEditedEventStartDateChange = (event) => {
        //handles the change of the edited event date
        console.log("EDITED Start DATE EVENT", event);
        console.log("EDITED Start DATE", event.$d);
        setPopoverStartDate(event.$d);
    };

    const handleEditedEventEndDateChange = (event) => {
        //handles the change of the edited event end date
        console.log("EDITED End DATE", event.$d);
        setPopoverEndDate(event.$d);
    };

    useEffect(() => {
        if (!isAgree || !isDialogOpened || !isCreatingNewEvent || newPopoverText.length === 0)
            return;
        setIsLoading(true);

        const newEvent = {
            title: newPopoverText,
            start: new Date(startEventDate),
            // start: startEventDate,
            extendedProps: {
                coach:
                    chosenElement && chosenElement["Name"] && chosenElement["Surname"]
                        ? chosenElement["Name"] + " " + chosenElement["Surname"]
                        : null,
                ScheduleID: 14,
                //OVO PROVJERITI
                "Workout Name": chosenElement && chosenElement["Workout Name"] ? chosenElement["Workout Name"] : 'Custom Event',
                "Workout Type": chosenElement && chosenElement["Workout Type"] ? chosenElement["Workout Type"] : 'Custom Event',
                "FK_WorkoutID": chosenElement && chosenElement["FK_WorkoutID"] ? chosenElement["FK_WorkoutID"] : 14,
                "isRecurring": chosenElement && chosenElement["isRecurring"] ? chosenElement["isRecurring"] : false,
                //Coach polje je opciono (ako korisnik ne izabere trening, ime i prezime trenera nece biti prikazano)
            },
            end: new Date(endEventDate),
            allDay: false,
        };
        console.log("NEW EVENT: ", newEvent);

        if (newPopoverText.length <= 1 || !startEventDate || !endEventDate || !newEvent) {
            props.showSnackbarMessage("error", "Greška prilikom dodavanja novog događaja!")();
            console.log("ERROR WHILE TRYING TO ADD A NEW EVENT");
            handleDialogClose();

            // setIsLoading(false);
            return;
        }

        //ako je event recurring, dodaje se u recurring events array
        if (isRecurring) {
            console.log("NOVI EVENT JESTE RECURRING, DODAJEM GA U RECURRING EVENTS ARRAY");
            //pomoću ovog state-a se renderuju recurring events na kalendaru
            setRecurringEvents((prev) => [
                //čuva prethode eventove, i dodaje novi
                ...prev,
                {
                    ...newEvent,
                    extendedProps: {
                        //TREBA LI OVO MAKNUTI?
                        coach:
                            chosenElement && chosenElement["Name"] && chosenElement["Surname"]
                                ? chosenElement["Name"] + " " + chosenElement["Surname"]
                                : null,
                        ScheduleID: null,
                        //OVO PROVJERITI
                        "Workout Name": chosenElement && chosenElement["Workout Name"] ? chosenElement["Workout Name"] : 'Custom Event',
                        "Workout Type": chosenElement && chosenElement["Workout Type"] ? chosenElement["Workout Type"] : 'Custom Event',
                        "FK_WorkoutID": chosenElement && chosenElement["FK_WorkoutID"] ? chosenElement["FK_WorkoutID"] : 14,
                        "isRecurring": chosenElement && chosenElement["isRecurring"] ? chosenElement["isRecurring"] : false,

                    },
                    rrule: new RRule({
                        freq: RRule.WEEKLY,
                        byweekday: newEvent.start.getDay(),
                        dtstart: new Date(newEvent.start),
                        until: new Date(new Date().getFullYear(), 11, 31), //this is the last day of the current year (11 is Decembar)
                    }),
                },
            ]);
        } else {
            //ako se event ne ponavlja (non recurring), onda se dodaje u non recurring events array
            //pomoću ovog state-a se renderuju non recurring events na kalendaru
            console.log("NOVI EVENT NIJE RECCURRING, DODAJEM GA U NON RECURRING EVENTS ARRAY");
            setNonRecurringEvents((prev) => [...prev, newEvent]);
        }

        //Dodavanje eventova u bazu
        //I non recurring i recurring eventovi koriste StartDate (non recurring za samo jedan datum, recurring za datum početka recurring eventa)

        console.log("DATUM ZA SLANJE", newEvent.start);
        console.log("MOMENT", moment(newEvent.start).format("YYYY-MM-DD HH:mm:ss"));

        jwtInterceptor
            .post(
                `${api_url}/schedule`,
                {
                    EventName: newPopoverText,
                    DayOfWeek: newEvent.start.getDay() === 0 ? 6 : newEvent.start.getDay(),
                    StartTime: moment(newEvent.start).format("HH:mm:ss"),
                    EndTime: moment(newEvent.end).format("HH:mm:ss"),
                    StartDate:
                        // !isRecurring && newEvent.start AKO NE BUDE RADILO OVO STAVITI

                        //I non recurring i recurring eventovi koriste StartDate (non recurring za samo jedan datum, recurring za datum početka recurring eventa)
                        //DODAJEMO 2 SATA NA START DATE (ZBOG TIME ZONE-A)
                        newEvent.start
                            ? moment(new Date(newEvent.start.getTime() + 7200000)).format(
                                  "YYYY-MM-DD HH:mm:ss"
                              )
                            : null,
                    FK_WorkoutID:
                        chosenElement && chosenElement["FK_WorkoutID"]
                            ? chosenElement["FK_WorkoutID"]
                            : 14, //14 is the fake workout id (CUSTOM EVENT in the database)
                    isRecurring: isRecurring,
                },
                {
                    withCredentials: true,
                }
            )
            .then((res) => {
                console.log("RESPONSE", res);
                props.showSnackbarMessage("success", "Novi događaj je uspješno dodat!")();
            })
            .catch((err) => {
                console.log(err);
                props.showSnackbarMessage("error", "Greška prilikom dodavanja novog događaja!")();
            })
            .finally(() => {
                // setIsLoading(false);
                props.handleSetFetchData(true); //force a re-render of the calendar, by changing the state in the parent component and fetching the data again

                //closing the dialog (after the user clicks on the agree button), and resetting the states
                handleDialogClose();
            });
    }, [isAgree, isDialogOpened, isCreatingNewEvent, newPopoverText]);

    const [isUpdated, setIsUpdated] = useState(false); //state that tracks if the event is updated

    const handleUpdateEvent = () => {
        //handles the update button in the dialog
        setIsUpdated(true);
    };

    const [isEditingEvent, setIsEditingEvent] = useState(false); //true when a person clicks edit button on an event
    const [isReadOnlyEvent, setIsReadOnlyEvent] = useState(false); //true when a person clicks on an event, but it doesnt edit it

    //EDITING AN EVENT
    useEffect(() => {
        if (!isUpdated || !isDialogOpened || !isEditingEvent) return;

        setIsLoading(true);

        const updatedEvent = {
            title: popoverText,
            start: new Date(popoverStartDate),
            extendedProps: {
                coach:
                    chosenElement && chosenElement["Name"] && chosenElement["Surname"]
                        ? chosenElement["Name"] + " " + chosenElement["Surname"]
                        : null,
                ScheduleID: popoverScheduleID,
                "Workout Name": chosenElement && chosenElement["Workout Name"] ? chosenElement["Workout Name"] : 'Custom Event',
                "Workout Type": chosenElement && chosenElement["Workout Type"] ? chosenElement["Workout Type"] : 'Custom Event',
                "FK_WorkoutID": chosenElement && chosenElement["FK_WorkoutID"] ? chosenElement["FK_WorkoutID"] : 14,
                "isRecurring": chosenElement && chosenElement["isRecurring"] ? chosenElement["isRecurring"] : false,
                //coach is optional (if the user doesn't choose a workout, the coach name won't be displayed)
            },
            end: new Date(popoverEndDate),
            // allDay: false,
        };
        // console.log("newEvent", newEvent);
        console.log("UPDATED EVENT", updatedEvent);
        if (popoverText.length <= 1 || !popoverStartDate || !popoverEndDate || !updatedEvent) {
            props.showSnackbarMessage("error", "Greška prilikom ažuriranja događaja!")();
            console.log("ERROR WHILE TRYING TO ADD UPDATE AN EVENT");
            handleDialogClose();
            return;
        }

        //if the event is recurring, it is added to the recurring events array
        if (isRecurring) {
            //This state is used to render the recurring events on the calendar
            setRecurringEvents((prev) => [
                //saving previous events, and adding a new one
                ...prev,
                {
                    ...updatedEvent,
                    extendedProps: {
                        coach:
                            chosenElement && chosenElement["Name"] && chosenElement["Surname"]
                                ? chosenElement["Name"] + " " + chosenElement["Surname"]
                                : null,
                        ScheduleID: popoverScheduleID,
                        "Workout Name": chosenElement && chosenElement["Workout Name"] ? chosenElement["Workout Name"] : 'Custom Event',
                        "Workout Type": chosenElement && chosenElement["Workout Type"] ? chosenElement["Workout Type"] : 'Custom Event',
                        "FK_WorkoutID": chosenElement && chosenElement["FK_WorkoutID"] ? chosenElement["FK_WorkoutID"] : 14,
                        "isRecurring": chosenElement && chosenElement["isRecurring"] ? chosenElement["isRecurring"] : false,
                    },
                    rrule: new RRule({
                        freq: RRule.WEEKLY,
                        byweekday: updatedEvent.start.getDay(),
                        dtstart: updatedEvent.start,
                        until: new Date(new Date().getFullYear(), 11, 31), //this is the last day of the current year (11 is Decembar)
                    }),
                },
            ]);
        } else {
            //if the event is not recurring, it is added to the non-recurring events array
            //This state is used to render the non-recurring events on the calendar

            setNonRecurringEvents((prev) => [...prev, updatedEvent]);
        }

        //adding the event to the database
        //both non-recurring and recurring events use StartDate (non-recurring for one time date, recurring for the first date of the recurring event)

        console.log("DATUM ZA SLANJE", updatedEvent.start);
        console.log("MOMENT", moment(updatedEvent.start).format("YYYY-MM-DD HH:mm:ss"));

        jwtInterceptor
            .put(
                `${api_url}/schedule`,
                {
                    ScheduleID: popoverScheduleID,
                    EventName: popoverText,
                    DayOfWeek: updatedEvent.start.getDay(),
                    StartTime: moment(updatedEvent.start).format("HH:mm:ss"),
                    EndTime: moment(updatedEvent.end).format("HH:mm:ss"),
                    StartDate:
                        // !isRecurring && newEvent.start AKO NE BUDE RADILO OVO STAVITI

                        //both non-recurring and recurring events use StartDate (non-recurring for one time date, recurring for the first date of the recurring event)
                        //ADDING 2 HOURS TO THE START DATE (BECAUSE OF THE TIME ZONE)
                        updatedEvent.start
                            ? moment(new Date(updatedEvent.start.getTime() + 7200000)).format(
                                  "YYYY-MM-DD HH:mm:ss"
                              )
                            : null,
                    FK_WorkoutID:
                        chosenElement && chosenElement["FK_WorkoutID"]
                            ? chosenElement["FK_WorkoutID"]
                            : 14, //14 is the fake workout id (CUSTOM EVENT in the database)
                    isRecurring: isRecurring,
                },
                {
                    withCredentials: true,
                }
            )
            .then((res) => {
                console.log("RESPONSE", res);
                props.showSnackbarMessage("success", "Događaj je uspješno ažuriran!")();
            })
            .catch((err) => {
                console.log(err);
                props.showSnackbarMessage("error", "Greška prilikom ažuriranja događaja!")();
            })
            .finally(() => {
                // setIsLoading(false);
                props.handleSetFetchData(true); //force a re-render of the calendar, by changing the state in the parent component and fetching the data again

                //closing the dialog (after the user clicks on the agree button), and resetting the states
                handleDialogClose();
            });
    }, [isUpdated, isDialogOpened, isEditingEvent, newPopoverText]);

    const handleStartEventDateTimeChange = (event) => {
        //handles the change of the start event date
        // const dateTimeRez = moment(event.$d).format("DD-MM-YYYY HH:mm");
        const nonFormattedDate = event.$d;
        setStartEventDate(nonFormattedDate);
        console.log(
            "NON FORMATTED DATE",
            nonFormattedDate,
            "MOMENT",
            moment(nonFormattedDate).format("DD-MM-YYYY HH:mm")
        );
    };

    const handleEndEventDateTimeChange = (event) => {
        //handles the change of the end event date
        // const dateTimeRez = moment(event.$d).format("DD-MM-YYYY HH:mm");
        const nonFormattedDate = event.$d;
        console.log("NON FORMATTED DATE", nonFormattedDate);
        setEndEventDate(nonFormattedDate);
    };
    const handleDialogOpen = () => {
        setIsDialogOpen(true);
        setIsAgree(false);
    };

    const handleCheckbox = (event) => {
        //Kod Edit komponente, prvi checkbox za dodjeljivanje treninga nekom događaju
        console.log("CHECKBOX CLICKED", event.target.checked);
        setIsChecked(event.target.checked);
    };

    const handleDialogClose = () => {
        console.log("CANCEL");
        setIsDialogOpen(false);

        resetNewEventStates();

        setIsCreatingNewEvent(false); //Important for switching between creating new event and editing existing one
    };

    //same data as previous 'Data'
    const [chosenElement, setChosenElement] = useState(null); //keep track of the chosen employee data (name, surname, workouts...)
    const [isRecurring, setIsRecurring] = useState(false); //keep track of the checkbox state (recurring or not recurring)

    const handleRecurringCheckbox = (event) => {
        //Mijenja vrijednost checkboxa (da li je event recurring ili ne)
        console.log("RECURRING CHECKBOX CLICKED", event.target.checked);
        setIsRecurring(event.target.checked);
    };

    const handleChosenElementChange = (event) => {
        //Bira se trening koji će se dodati kao event
        console.log("CHOSEN ELEMENT", event.target.value);
        setChosenElement(event.target.value);
    };

    const handleAgree = () => {
        //Dugme za potvrdu u Dialogu
        setIsAgree(true);
        setIsReadOnlyEvent(false);
        setIsEditingEvent(true);
        setIsCreatingNewEvent(false); //VIDI TREBA LI OVO

        console.log(
            "AGREE btn clicked",
            "isCreatingNewEvent",
            isCreatingNewEvent,
            "isEditingEvent",
            isEditingEvent,
            "isReadOnlyEvent",
            isReadOnlyEvent
        );
    };

    const handleBlur = () => {
        setIsBlured(true);
    };

    const [allEvents, setAllEvents] = useState([]); //contains info about all events (recurring and non-recurring)

    useEffect(() => {
        console.log("DOSAO SAM DO OVOGA ALL EVENTA");
        setIsLoading(true);
        try {
            //when the recurring and non-recurring events change, the all events array is updated
            console.log("NON RECURRING EVENTS", ...nonRecurringEvents);
            setAllEvents([
                ...nonRecurringEvents,
                ...recurringEvents.flatMap((event) => {
                    console.log("RECC EVENT", event);
                    return event.rrule.all().map((date) => {
                        // setIsLoading(false);
                        //ovo 'date' je ponavljanje datuma za svaki reccurring event nedjeljno, do kraja godine
                        console.log("DATE", date);
                        return {
                            title: event.title,
                            start: date,
                            end: changeDatesTime(date, event.end, 0), //sets the end date to 1 hour after the start date
                            extendedProps: {
                                coach: event.extendedProps.coach, //this is used to display the coach name in the dialog
                                ScheduleID: event.extendedProps.ScheduleID,
                                "Workout Name": event.extendedProps["Workout Name"],
                                "Workout Type": event.extendedProps["Workout Type"],
                                "FK_WorkoutID": event.extendedProps["FK_WorkoutID"],
                                "isRecurring": event.extendedProps["isRecurring"],
                            },
                        };
                    });
                }),
            ]);
        } catch (err) {
            console.log(err);
            props.showSnackbarMessage("error", "Greška prilikom prikazivanja događaja!")();
        } finally {
            setIsLoading(false); //Na kraju, kad se podaci učitaju i eventi prikažu, onda loader završava
        }
    }, [nonRecurringEvents, recurringEvents]);

    const handleDeleteEvent = () => {
        //Brisanje događaja
        jwtInterceptor
            .delete(`${api_url}/schedule/${popoverScheduleID}`, { withCredentials: true })
            .then((res) => {
                console.log(res);
                props.showSnackbarMessage("success", "Događaj je uspješno obrisan!")();
            })
            .catch((err) => {
                console.log(err);
                props.showSnackbarMessage("error", "Greška prilikom brisanja događaja!")();
            })
            .finally(() => {
                props.handleSetFetchData(true); //force a re-render of the calendar, by changing the state in the parent component and fetching the data again
            });
    };

    const renderedWorkouts = [];

    if (isLoading) return <Loader />;

    return (
        <>
            {/* Displaying calendar */}
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={"dayGridMonth"}
                headerToolbar={{
                    //zaglavlje kalendara (case sensitive) NE DIRAJ IMENA JER MORAJU BITI OVAKVA
                    start: "prev,today,next addEventButton", //addEventButton je custom button
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                customButtons={{
                    addEventButton: user.isEmployee===1 || user.isAdmin===1 ? 
                    {
                        text: "Dodaj događaj",
                        click: handleNewEventCreate,
                        hint: "Kreiraj novi događaj!",
                    } : null
                }}
                eventChange={handleEventMouseEnter}
                events={allEvents} //events that are displayed on the calendar
                height={"90vh"}
                // timeZone="UTC"
                // selectable={true}
                // select={handleNewEventCreate}
                businessHours={businessHours} //business hours of the calendar (8AM - 10PM), blurs the rest of the calendar
                eventClick={handleEventMouseEnter}
            />

            {/* Displaying dialog (for creating and editing events) */}
            {popoverText && (
                <Box className="popover">
                    {/* IMPORTANT NOTE: Dialog component throws warnings when "dialogText" contains 
                    something other that fragments (divs, components...), so just ignore it */}
                    <DialogComponent
                        label={"Renew"}
                        disabled={false}
                        style={{
                            backgroundColor: "#cccccc",
                            color: "#666666",
                            border: "0px solid black",
                        }}
                        // handleBlur={handleDialogBlur} //OVO PROVJERITI
                        handleDialogOpen={handleDialogOpen}
                        handleDialogClose={handleDialogClose}
                        isDialogOpened={isDialogOpened}
                        dialogTitle={
                            isCreatingNewEvent ? (
                                <Typography>Dodaj novi događaj</Typography>
                            ) : (
                                //Ime eventa (i ime trenera) koje se prikazuje u dialogu
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "space-between", //ovo će postaviti ikonicu za brisanje na desnu stranu
                                        fontSize: 23,
                                        fontWeight: "bold",
                                    }}
                                >
                                    {/* {popoverText + " (" + popoverCoach + ")"} */}
                                    {popoverText}
                                    {/* <Box sx={{ mr: 1, fontSize: "small" }} >{popoverCoach}</Box> */}
                                    {/* Dugme obriši se samo prikazuje kad se događaj edituje */}
                                    {isEditingEvent && (
                                        <ButtonIcon
                                            label={"Obriši"}
                                            startIcon={<DeleteForeverIcon sx={{ mr: -1 }} />}
                                            sx={{ color: "#ff3200", fontSize: 15 }}
                                            handleClick={handleDeleteEvent}
                                        />
                                    )}
                                </Box>
                            )
                        }
                        dialogText={
                            user.isClient === 0 && (isCreatingNewEvent || isEditingEvent) ? (
                                // {/* Kreiranje ili editovanje događaja (u zavisnosti od isCreatingNewEvent)*/}
                                <AddEditEventComponent
                                    popoverText={popoverText}
                                    popoverStartDate={popoverStartDate}
                                    popoverEndDate={popoverEndDate}
                                    isChecked={isChecked}
                                    handleEditedEventNameChange={handleEditedEventNameChange}
                                    handleEditedEventStartDateChange={
                                        handleEditedEventStartDateChange
                                    }
                                    handleEditedEventEndDateChange={
                                        handleEditedEventEndDateChange
                                    }
                                    handleCheckbox={handleCheckbox}
                                    handleRecurringCheckbox={handleRecurringCheckbox}
                                    handleChosenElementChange={handleChosenElementChange}
                                    chosenElement={chosenElement}
                                    isBlured={isBlured}
                                    handleBlur={handleBlur}
                                    popoverIsRecurring={popoverIsRecurring} //ovo je default vrijednost checkboxa (da li je event recurring ili ne)
                                    isCreatingNewEvent={isCreatingNewEvent}
                                    isEditingEvent={isEditingEvent}    
                                />
                                
                            ) : (
                                // Kad se klikne na event, ali se ne edituje (samo se prikazuju informacije)
                                isReadOnlyEvent && (
                                    <ReadOnlyEventComponent
                                        popoverStartDate={popoverStartDate}
                                        popoverEndDate={popoverEndDate}
                                        popoverCoach={popoverCoach}
                                        popoverWorkoutName={popoverWorkoutName} //ovo je ime treninga koje se prikazuje u dialogu
                                        popoverWorkoutType={popoverWorkoutType}  //ovo je tip treninga koje se prikazuje u dialogu
  
                                    />
                                )
                            )
                        }
                        disagree={"Otkaži"}
                        agree={isCreatingNewEvent ? "Dodaj" : isReadOnlyEvent ? "Izmijeni" : "Sačuvaj izmjene"}
                        handleAgree={isEditingEvent ? handleUpdateEvent : handleAgree}
                        showButton={false}
                        disableAgreeBtn={user.isClient === 1}
                    />
                </Box>
            )}
        </>
    );
}

export default ScheduleComponent;
