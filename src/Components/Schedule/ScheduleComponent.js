import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { RRule } from "rrule";
import DialogComponent from "../../Utilities/Dialog/Dialog";
import scheduleIcon from "../../images/schedule.png";
import moment from "moment";
import { useEffect } from "react";
import TextField from "@mui/material/TextField";
import DateTimePickerComponent from "../../Utilities/DatePickers/datepickers";
import ColorCheckbox from "../../Utilities/Checkbox/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import { Select } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import dayjs from "dayjs";
import dotenv from 'dotenv';
dotenv.config();

function ScheduleComponent(props) {
    const [data] = useState(props.employeeWorkouts); //contains info about personal coaches, their workouts and time schedules

    const findNearestDayOfWeek = (dayOfWeek, date) => {
        //returns the nearest date that has a certain day of the week (1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday, 7 - Sunday)
        const currDate = new Date(date);
        while (currDate.getDay() !== dayOfWeek) {
            currDate.setDate(currDate.getDate() + 1);
        }

        return currDate;
    };

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

                console.log("newStartDate", newStartDate, "newEndDate", newEndDate);
                console.log("NewStartDay", newStartDate.getDay());
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

            console.log("newStartDate", newStartDate, "newEndDate", newEndDate);
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
                                : null, //this is used to display the coach name in the dialog
                        ScheduleID: element["ScheduleID"],
                    },
                    rrule: new RRule({
                        //Setting up the recurring rule
                        //by weekday is an array of days of the week (0 - Sunday, 1 - Monday,..., 6 - Saturday)
                        //but in the database, element["DayOfWeek"] is in format 1 - Monday, 2 - Tuesday,..., 7 - Sunday
                        freq: RRule.WEEKLY,
                        byweekday: element["DayOfWeek"] - 1, // Adjust for the day numbering difference
                        // byweekday: [element["DayOfWeek"] === 7 ? 0 : element["DayOfWeek"] - 1], // Adjust for the day numbering difference
                        dtstart: newStartDate,
                        until: new Date(new Date().getFullYear(), 11, 31), //this is the last day of the current year (11 is Decembar)
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

        setPopoverText(arg.event.title); // Set popover text on event mouse enter
        setPopoverCoach(arg.event.extendedProps.coach); //sets coach name and surname into a state
        setPopoverScheduleID(arg.event.extendedProps.ScheduleID); //sets schedule id into a state

        handleDialogOpen(); //opens Dialog
    };

    const [isDialogOpened, setIsDialogOpen] = useState(false);
    const [isAgree, setIsAgree] = useState(false);
    const [isSnackbarOpened, setIsSnackbarOpened] = useState(false);
    const [errorSnackbarOpened, setErrorSnackbarOpened] = useState(false);
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

        const newEvent = {
            title: newPopoverText,
            start: new Date(startEventDate),
            extendedProps: {
                coach:
                    chosenElement && chosenElement["Name"] && chosenElement["Surname"]
                        ? chosenElement["Name"] + " " + chosenElement["Surname"]
                        : null,
                ScheduleID: null,

                //coach is optional (if the user doesn't choose a workout, the coach name won't be displayed)
            },
            end: new Date(new Date(endEventDate).getTime()),
            allDay: false,
        };
        // console.log("newEvent", newEvent);

        if (newPopoverText.length <= 1 || !startEventDate || !endEventDate || !newEvent) {
            setErrorSnackbarOpened(true);
            console.log("ERROR WHILE TRYING TO ADD A NEW EVENT");
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
                    ...newEvent,
                    extendedProps: {
                        //TREBA LI OVO MAKNUTI?
                        coach:
                            chosenElement && chosenElement["Name"] && chosenElement["Surname"]
                                ? chosenElement["Name"] + " " + chosenElement["Surname"]
                                : null,
                        ScheduleID: null,
                    },
                    rrule: new RRule({
                        freq: RRule.WEEKLY,
                        byweekday: [newEvent.start.getDay()] - 1,
                        dtstart: newEvent.start,
                        until: new Date(new Date().getFullYear(), 11, 31), //this is the last day of the current year (11 is Decembar)
                    }),
                },
            ]);
        } else {
            //if the event is not recurring, it is added to the non-recurring events array
            //This state is used to render the non-recurring events on the calendar

            setNonRecurringEvents((prev) => [...prev, newEvent]);
        }

        //adding the event to the database
        //both non-recurring and recurring events use StartDate (non-recurring for one time date, recurring for the first date of the recurring event)

        console.log("DATUM ZA SLANJE", newEvent.start);
        console.log("MOMENT", moment(newEvent.start).format("YYYY-MM-DD HH:mm:ss"));

        jwtInterceptor
            .post(
                `${api_url}/schedule`,
                {
                    EventName: newPopoverText,
                    DayOfWeek: newEvent.start.getDay(),
                    StartTime: moment(newEvent.start).format("HH:mm:ss"),
                    EndTime: moment(newEvent.end).format("HH:mm:ss"),
                    StartDate:
                        // !isRecurring && newEvent.start AKO NE BUDE RADILO OVO STAVITI

                        //both non-recurring and recurring events use StartDate (non-recurring for one time date, recurring for the first date of the recurring event)
                        //ADDING 2 HOURS TO THE START DATE (BECAUSE OF THE TIME ZONE)
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
                setIsSnackbarOpened(true);
            })
            .catch((err) => {
                console.log(err);
                setErrorSnackbarOpened(true);
            });

        props.handleSetFetchData(true); //force a re-render of the calendar, by changing the state in the parent component and fetching the data again

        //closing the dialog (after the user clicks on the agree button), and resetting the states
        handleDialogClose();
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

        const updatedEvent = {
            title: popoverText,
            start: new Date(popoverStartDate),
            extendedProps: {
                coach:
                    chosenElement && chosenElement["Name"] && chosenElement["Surname"]
                        ? chosenElement["Name"] + " " + chosenElement["Surname"]
                        : null,
                ScheduleID: popoverScheduleID,
                //coach is optional (if the user doesn't choose a workout, the coach name won't be displayed)
            },
            end: new Date(popoverEndDate),
            allDay: false,
        };
        // console.log("newEvent", newEvent);
        console.log("UPDATED EVENT", updatedEvent);
        if (popoverText.length <= 1 || !popoverStartDate || !popoverEndDate || !updatedEvent) {
            setErrorSnackbarOpened(true);
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
                        //TREBA LI OVO MAKNUTI?
                        coach:
                            chosenElement && chosenElement["Name"] && chosenElement["Surname"]
                                ? chosenElement["Name"] + " " + chosenElement["Surname"]
                                : null,
                        ScheduleID: popoverScheduleID,
                    },
                    rrule: new RRule({
                        freq: RRule.WEEKLY,
                        byweekday: [updatedEvent.start.getDay()] - 1,
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
                setIsSnackbarOpened(true);
            })
            .catch((err) => {
                console.log(err);
                setErrorSnackbarOpened(true);
            });

        props.handleSetFetchData(true); //force a re-render of the calendar, by changing the state in the parent component and fetching the data again

        //closing the dialog (after the user clicks on the agree button), and resetting the states
        handleDialogClose();
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
        setEndEventDate(nonFormattedDate);
    };
    const handleDialogOpen = () => {
        setIsDialogOpen(true);
        setIsAgree(false);
    };

    const handleCheckbox = (event) => {
        //handles the change of the checkbox
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
        //handles the change of the checkbox in the dialog
        setIsRecurring(event.target.checked);
    };

    const handleChosenElementChange = (event) => {
        //handles the change of the workout in the dialog
        setChosenElement(event.target.value);
    };

    const handleAgree = () => {
        //handles the agree button in the dialog
        setIsAgree(true);
        setIsReadOnlyEvent(false);
        setIsEditingEvent(true);
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
        //when the recurring and non-recurring events change, the all events array is updated
        setAllEvents([
            ...nonRecurringEvents,
            ...recurringEvents.flatMap((event) => {
                // console.log("EVENT", event);
                return event.rrule.all().map((date) => {
                    return {
                        title: event.title,
                        start: date,
                        end: changeDatesTime(date, event.end, 0), //sets the end date to 1 hour after the start date
                        extendedProps: {
                            coach: event.extendedProps.coach, //this is used to display the coach name in the dialog
                            ScheduleID: event.extendedProps.ScheduleID,
                        },
                    };
                });
            }),
        ]);
    }, [nonRecurringEvents, recurringEvents]);

    const renderedWorkouts = [];

    return (
        <>
            {/* Displaying calendar */}
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView={"dayGridMonth"}
                headerToolbar={{
                    //header of the calendar (case sensitive)
                    start: "today prev,next addEventButton", //addEventButton is a custom button
                    center: "title",
                    end: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                customButtons={{
                    addEventButton: {
                        text: "Add event",
                        click: handleNewEventCreate,
                        hint: "Create an event!",
                    },
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
                <div className="popover">
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
                            isCreatingNewEvent
                                ? "Add new event"
                                : popoverText + " (" + popoverCoach + ")"
                        } //event name and coach name
                        dialogText={
                            isCreatingNewEvent ? (
                                //creating an event
                                <>
                                    <TextField
                                        className="eventClass"
                                        name="eventTitle"
                                        label="Event"
                                        onChange={handleNewEventNameChange}
                                        value={newPopoverText}
                                        onBlur={handleBlur}
                                        error={!newPopoverText.length && isBlured} //input form becomes red if mail is invalid or field out of focus
                                    />

                                    <DateTimePickerComponent
                                        className={"start-event-date-picker"}
                                        label={"Choose a start date"}
                                        value={startEventDate}
                                        handleDateTimeChange={handleStartEventDateTimeChange}
                                        disablePast={true}
                                        disableFuture={false}
                                        error={!startEventDate.length}
                                        // defaultValue={dayjs().add(1, "minute")}
                                    />

                                    <DateTimePickerComponent
                                        className={"end-event-date-picker"}
                                        label={"Choose a end date"}
                                        value={endEventDate}
                                        handleDateTimeChange={handleEndEventDateTimeChange}
                                        disablePast={true}
                                        disableFuture={false}
                                        error={
                                            !endEventDate.length || endEventDate < startEventDate
                                        }
                                        // defaultValue={dayjs().add(61, "minute")}
                                    />
                                    <div className="workout-data-container">
                                        <ColorCheckbox
                                            labelMessage={"Assign a workout"}
                                            handleCheckbox={handleCheckbox}
                                        />

                                        {isChecked && (
                                            <>
                                                <ColorCheckbox
                                                    labelMessage={"Recurring weekly"}
                                                    handleCheckbox={handleRecurringCheckbox}
                                                />
                                                <Select
                                                    value={chosenElement || ""}
                                                    onChange={handleChosenElementChange}
                                                    // onBlur={handleBlurWorkout}
                                                    // error={coach.length === 0 && isBluredCoach}
                                                >
                                                    {data.map((employeeElement) => {
                                                        if (
                                                            !renderedWorkouts.includes(
                                                                employeeElement["FK_WorkoutID"]
                                                            )
                                                        ) {
                                                            renderedWorkouts.push(
                                                                employeeElement["FK_WorkoutID"]
                                                            ); //only renders workouts once
                                                            return (
                                                                <MenuItem
                                                                    value={employeeElement}
                                                                    key={uuidv4()}
                                                                >
                                                                    {
                                                                        employeeElement[
                                                                            "Workout Name"
                                                                        ]
                                                                    }
                                                                    {" - (" +
                                                                        employeeElement["Name"]}
                                                                    {" " +
                                                                        employeeElement["Surname"] +
                                                                        ")"}
                                                                </MenuItem>
                                                            );
                                                        } else {
                                                            return null;
                                                        }
                                                    })}
                                                </Select>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : isEditingEvent ? (
                                <>
                                    {/* Editing an event */} {/* ISTO KAO I KOD ADD EVENTA */}
                                    <TextField
                                        className="eventClass"
                                        name="eventTitle"
                                        label="Event"
                                        onChange={handleEditedEventNameChange}
                                        value={popoverText} //previous event name
                                        onBlur={handleBlur}
                                        error={!popoverText.length && isBlured} //input form becomes red if mail is invalid or field out of focus
                                    />
                                    <DateTimePickerComponent
                                        className={"start-event-date-picker"}
                                        label={"Choose a start date"}
                                        // date={} //previous start date
                                        handleDateTimeChange={handleEditedEventStartDateChange}
                                        disablePast={true}
                                        disableFuture={false}
                                        error={!popoverStartDate.length}
                                        defaultValue={dayjs(popoverStartDate)}
                                    />
                                    <DateTimePickerComponent
                                        className={"end-event-date-picker"}
                                        label={"Choose a end date"}
                                        // date={endEventDate}
                                        handleDateTimeChange={handleEditedEventEndDateChange}
                                        disablePast={true}
                                        disableFuture={false}
                                        error={
                                            !popoverEndDate.length ||
                                            popoverEndDate < popoverStartDate
                                        }
                                        defaultValue={dayjs(popoverEndDate)}
                                    />
                                    <div className="workout-data-container">
                                        <ColorCheckbox
                                            labelMessage={"Assign a workout"}
                                            handleCheckbox={handleCheckbox}
                                        />

                                        {isChecked && (
                                            <>
                                                <ColorCheckbox
                                                    labelMessage={"Recurring weekly"}
                                                    handleCheckbox={handleRecurringCheckbox}
                                                />
                                                <Select
                                                    value={chosenElement || ""}
                                                    onChange={handleChosenElementChange}
                                                    // onBlur={handleBlurWorkout}
                                                    // error={coach.length === 0 && isBluredCoach}
                                                >
                                                    {data.map((employeeElement) => {
                                                        if (
                                                            !renderedWorkouts.includes(
                                                                employeeElement["FK_WorkoutID"]
                                                            )
                                                        ) {
                                                            renderedWorkouts.push(
                                                                employeeElement["FK_WorkoutID"]
                                                            ); //only renders workouts once
                                                            return (
                                                                <MenuItem
                                                                    value={employeeElement}
                                                                    key={uuidv4()}
                                                                >
                                                                    {
                                                                        employeeElement[
                                                                            "Workout Name"
                                                                        ]
                                                                    }
                                                                    {" - (" +
                                                                        employeeElement["Name"]}
                                                                    {" " +
                                                                        employeeElement["Surname"] +
                                                                        ")"}
                                                                </MenuItem>
                                                            );
                                                        } else {
                                                            return null;
                                                        }
                                                    })}
                                                </Select>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                // when a user clicks on an event, it displays the event info
                                isReadOnlyEvent && (
                                    <>
                                        {/* Editing an event */}
                                        <img
                                            src={scheduleIcon}
                                            style={{ width: "30px", marginRight: "5px" }}
                                        />
                                        <>
                                            {moment(popoverStartDate).format(
                                                "DD MMMM, YYYY (HH:mm"
                                            ) +
                                                "h" +
                                                " - " +
                                                moment(popoverEndDate).format("HH:mm") +
                                                "h)"}
                                        </>
                                    </>
                                )
                            )
                        }
                        disagree={"Cancel"}
                        agree={isCreatingNewEvent ? "Add" : isReadOnlyEvent ? "Edit" : "Update"}
                        handleAgree={isEditingEvent ? handleUpdateEvent : handleAgree}
                        showButton={false}
                        disableAgreeBtn={
                            //OVO NAPRAVITI DA RADI
                            // isCreatingNewEvent
                            //     ? !startEventDate.length ||
                            //       !endEventDate.length ||
                            //       newPopoverText.length <= 1 //<=1 bcs newPopverText can have 1 empty space (defined earlier)
                            //     : false
                            // || (isChecked && !chosenElement)
                            false
                        }
                    />
                </div>
            )}
        </>
    );
}

export default ScheduleComponent;
