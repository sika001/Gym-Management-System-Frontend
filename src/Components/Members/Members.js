import DataTable from "../../Utilities/Data Table/Data-table";
import moment from "moment";
import { useEffect, useState } from "react";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import CheckInIcon from "@mui/icons-material/CheckCircleOutlineTwoTone";
import CheckOutIcon from "@mui/icons-material/Logout";
import IconButton from "@mui/material/IconButton";
import { useSnackbar } from "notistack";
import { Avatar, Box, Input, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Loader from "../../Utilities/Loader/Loader";

function Members() {
    // const members = useLoaderData(); //fetches data from loader function
    const [members, setMembers] = useState(null);
    const [isLoading, setIsLoading] = useState(true); //used to show loading while fetching data from server

    const [searchQuery, setSearchQuery] = useState(""); //koristi se za pretragu
    const [filteredMembers, setFilteredMembers] = useState(null); //koristi se za pretragu

    const [rows, setRows] = useState([]); //koristi se za tabelu
    const [columns, setColumns] = useState([]); //koristi se za tabelu

    const { enqueueSnackbar } = useSnackbar();

    const handleSearch = (event) => {
        //pretraga po imenu, prezimenu, broju telefona, nazivu, tipu i statusu članarine
        const query = event.target.value;
        setSearchQuery(query); //vrijednost unutar search polja

        //filtriramo članove, i postavljamo ih u filteredMembers (koje renderujemo u tabeli)
        const filtered = members.filter((member) => {
            return (
                member.Name.toLowerCase().includes(query.toLowerCase()) ||
                member.Surname.toLowerCase().includes(query.toLowerCase()) ||
                member.Phone.includes(query) ||
                member["Workout Name"].toLowerCase().includes(query.toLowerCase()) ||
                member["Membership Type"].toLowerCase().includes(query.toLowerCase()) ||
                //ako je status 1, znači da je članarina aktivna, pa provjeravamo da li sadrži riječ "active"
                (member.Status === 1 && "Aktivna".toLowerCase().includes(query.toLowerCase())) ||
                //ako je status 0, znači da je članarina istekla, pa provjeravamo da li sadrži riječ "expired"
                (member.Status === 0 && "Istekla".toLowerCase().includes(query.toLowerCase()))
            );
        });
        setFilteredMembers(filtered);

        console.log("Search query: ", query);
    };

    const showSnackbarMessage = (variant, message) => () => {
        // varient može biti: success, error, warning, info
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //pozicija snackbar poruke
        });
    };

    const api_url = process.env.REACT_APP_API_URL;

    const handleCheckIn = async (member) => {
        try {
            console.log("CHECK IN POKRENUT");
            const response = await jwtInterceptor.post(
                `${api_url}/arrival`,
                {
                    FK_ClientID: member.FK_ClientID,
                },
                {
                    withCredentials: true,
                }
            ); //Check in člana

            if (response.data) {
                showSnackbarMessage(
                    "success",
                    `${member.Name} ${member.Surname} sucessfully checked in!`
                )();
                setMembers((prevMembers) =>
                    prevMembers.map((prevMember) =>
                        prevMember.FK_ClientID === member.FK_ClientID
                            ? { ...prevMember, AtGym: "Yes" }
                            : prevMember
                    )
                );
            } else {
                showSnackbarMessage(
                    "error",
                    `Error while trying to check-in ${member.Name} ${member.Surname}`
                )();
            }
        } catch (err) {
            showSnackbarMessage(
                "error",
                `Error while trying to check-in ${member.Name} ${member.Surname}`
            )();
        }
    };

    const handleCheckOut = async (member) => {
        try {
            const response = await jwtInterceptor.put(
                `${api_url}/arrival`,
                {
                    FK_ClientID: member.FK_ClientID,
                },
                { withCredentials: true }
            ); //Check out the member

            if (response.data) {
                showSnackbarMessage("success", `${member.Name} ${member.Surname} checked out!`)();
                setMembers((prevMembers) =>
                    prevMembers.map((prevMember) =>
                        prevMember.FK_ClientID === member.FK_ClientID
                            ? { ...prevMember, AtGym: "No" }
                            : prevMember
                    )
                );
                // setCheckOutMsg("");
            } else {
                showSnackbarMessage(
                    "error",
                    `Error while trying to check out ${member.Name} ${member.Surname}`
                )();
                console.log("Check-out failed.");
            }
        } catch (err) {
            showSnackbarMessage(
                "error",
                `Error while trying to check out ${member.Name} ${member.Surname}`
            )();
            console.error("Error while trying to check out the member:", err);
        }
    };

    const updateExpiredMemberships = async () => {
        //updates expired memberships on page load
        try {
            setIsLoading(true);
            const response = await jwtInterceptor
                .put(`${api_url}/membership`, null, {
                    withCredentials: true,
                })
                .then((response) => {
                    console.log("Updated expired memberships", response.data);
                });
        } catch (err) {
            console.log("Error while trying to update expired memberships", err);
        }
    };

    const getAllClientsCurrentlyAtGym = async () => {
        //gets all clients that are currently at gym
        try {
            const response = await jwtInterceptor.get(`${api_url}/arrival`, {
                withCredentials: true,
            });
            console.log("At Gym: ", response.data);
            setMembers((prev) => {
                return prev.map((member) => {
                    const atGym = response.data.some((arrival) => {
                        return arrival.FK_ClientID === member.FK_ClientID;
                    });
                    return { ...member, AtGym: atGym ? "Yes" : "No" };
                });
            });
        } catch (err) {
            console.log("Error while trying to get members at gym!", err);
        }
    };

    useEffect(() => {
        async function fetchMembers() {
            try {
                setIsLoading(true);
                await jwtInterceptor
                    .get(`${api_url}/membership`, {
                        withCredentials: true,
                    })
                    .then((response) => {
                        console.log("Members", response.data);
                        setMembers(response.data);

                        updateExpiredMemberships();
                        getAllClientsCurrentlyAtGym();
                    })
                    .finally(() => {
                        setIsLoading(false); //na kraju fetcha, postavljamo isLoading na false
                    });
            } catch (err) {
                console.log(err);
            }
        }

        fetchMembers();
    }, []);

    useEffect(() => {
        if (!members) return;
        //kad se dovuče data, i kad se promijeni searchQuery, pozivamo mijenjamo sadržaj tabele
        try {
            setIsLoading(true);
            setRowsData();
            setColumnsData();
        } catch (err) {
            console.log(err);
        } finally {
            setIsLoading(false); //na kraju renderovanja tabele, postavljamo isLoading na false
        }
    }, [members, filteredMembers]);

    const setRowsData = () => {
        //ako nijesmo ništa pretraživali, prikazujemo sve članove, inače prikazujemo filtrirane članove
        let displayArray = filteredMembers ? filteredMembers : members;
        console.log(filteredMembers ? "DISPLAY FILTERED MEMBERS: " : "DISPLAY MEMBERS: ");

        setRows(
            displayArray.map((member, index) => {
                //određujemo koji će se podaci prikazati u tabeli
                // console.log("Member: ", member);
                return {
                    ...member,
                    id: index + 1,
                    FullName: `${member.Name} ${member.Surname}`,
                    Start: moment(member.Start).format("DD MMM YYYY"),
                    Expiry: moment(member.Expiry).format("DD MMM YYYY"),
                };
            })
        );
    };

    //rows i colums se prosljeđuju u tabelu
    const setColumnsData = () => {
        //
        setColumns([
            //field je vrijednost koja se nalazi u objektu koji se nalazi u rows, i mora biti identičan sa tom vrijednošću
            { field: "id", headerName: "Br.", width: 40 },
            {
                field: "FullName", //Name + Surname (definisano u rows)
                headerName: "Član",
                width: 200,
                renderCell: (params) => {
                    const member = params.row; //sadrži sve informacije o korisniku u tom redu
                    // console.log("Member RED RENDER: ", member);
                    return (
                        <div style={{ display: "flex", alignItems: "center" }}>
                            {/* Avatar komponenta se koristi da bi tabela renderovala sliku */}
                            <Avatar
                                alt={`${member.Name}`}
                                src={`${api_url}/uploads/${member.Picture}`}
                            />
                            {/* alt (ako nema slike, uzima početno slovo imena) */}
                            <div style={{ marginLeft: "10px" }}>
                                {member.Name} {member.Surname}
                            </div>
                        </div>
                    );
                },
            },

            {
                field: "Phone",
                headerName: "Broj telefona",
                width: 120,
            },
            {
                field: "Workout Name",
                headerName: "Trening",
                width: 150,
            },
            {
                field: "Start",
                headerName: "Početak",
                width: 130,
            },
            {
                field: "Expiry",
                headerName: "Ističe",
                width: 130,
                renderCell: (params) => {
                    const expiryDate = params.value; //params.value is the value of the field Expiry
                    const expiresIn = moment(expiryDate).diff(moment(new Date()), "days");
                    return (
                        <div>
                            {moment(expiryDate).format("DD MMM YYYY")}
                            <div style={{ fontSize: "12px", color: "gray" }}>
                                {expiresIn >= 0 ? `${expiresIn} dana preostalo` : "Istekla članarina!"}
                            </div>
                        </div>
                    );
                },
            },

            {
                field: "Membership Type",
                headerName: "Vrsta članarine",
                width: 150,
            },
            {
                field: "AtGym", //This indicates the actaul field name
                headerName: "U teretani", //This is the name that will be displayed in the table header
                width: 80,
            },
            {
                field: "Check In",
                headerName: "Check In / Check Out",
                width: 150,
                sort: true,
                renderCell: (params) => {
                    const member = params.row; //params.row is the object that contains all the data for the row
                    const expiryDate = member.Expiry; //Value of the Expiry field
                    const expired = moment(expiryDate).diff(moment(new Date()), "days") < 0; //Number of days until the membership expires

                    const disableCheckIn = member["AtGym"] === "Yes" || expired; //if member is already at gym or membership is expired, disable button
                    const disableCheckOut = member["AtGym"] === "No" || expired; //if member is not at gym or membership is expired, disable button

                    return (
                        <>
                            <IconButton
                                aria-label="Check In"
                                disabled={disableCheckIn} //if member is already at gym or membership is expired, disable button
                                onClick={() => handleCheckIn(member)}
                            >
                                <CheckInIcon style={{ color: disableCheckIn ? "grey" : "green" }} />
                            </IconButton>
                            <IconButton
                                aria-label="Check Out"
                                disabled={disableCheckOut} //if member is not at gym or membership is expired, disable button
                                onClick={() => handleCheckOut(member)}
                            >
                                <CheckOutIcon style={{ color: disableCheckOut ? "grey" : "red" }} />
                            </IconButton>
                        </>
                    );
                },
            },
        ]);
    };

    if (isLoading) {
        return <Loader />;
    }

    return (
        <>
            <Box>
                {/* Pretraga */}
                <Input
                    placeholder="Pretraga"
                    sx={{ width: "20%", marginTop: "20px" }}
                    value={searchQuery}
                    onChange={handleSearch}
                    startAdornment={
                        <InputAdornment position="end">
                            <SearchIcon />
                        </InputAdornment>
                    }
                />

                {/* Tabela članova */}
                <DataTable
                    rows={rows}
                    columns={columns}
                    style={{ width: "100%" }} //visina se automatski podešava (u data-table.js)
                    loading={isLoading}
                />
            </Box>
        </>
    );
}

export default Members;
