import { Box, IconButton, Input, InputAdornment } from "@mui/material";
import DataTable from "../../Utilities/Data Table/Data-table";
import moment from "moment";
import { useEffect, useState } from "react";
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { useSnackbar } from "notistack";
import { Avatar } from '@mui/material';
import DialogComponent from "../../Utilities/Dialog/Dialog";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";
import SearchIcon from '@mui/icons-material/Search';
import ButtonIcon from "../../Utilities/Button/Button";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import HistoryIcon from '@mui/icons-material/History';
import RestoreEmployee from "./RestoreEmployee";
import Loader from "../../Utilities/Loader/Loader";

function EmployeeTable(props) {
        const [employees, setEmployees] = useState(null); //sadrži sve zaposlene
        const [isLoading, setIsLoading] = useState(true); //koristi se za loading indikator

        const [filteredEmployees, setFilteredEmployees] = useState(); //koristi se za pretragu
        const [isSalaryPaid, setIsSalaryPaid] = useState(false); //pomoću ovoga stanja re-renderujemo tabelu nakom uplate 
        const [isDialogOpened, setIsDialogOpened] = useState(false); //prikazuje Dialog komponentu
        const [transactionInfo, setTransactionInfo] = useState(null); //koristi se za slanje transakcije (isplata plate)
        const [searchQuery, setSearchQuery] = useState(""); //koristi se za pretragu 
        const [deleteButtonClicked, setDeleteButtonClicked] = useState(false); //koristi se za brisanje zaposlenog
        const [employeeToBeDeleted, setEmployeeToBeDeleted] = useState(null); //koristi se za brisanje zaposlenog [NE KORISTI SE
       
        
        const [deletedEmployees, setDeletedEmployees] = useState(null); //sadrži obrisane zaposlene 
        const [isRestoredEmployee, setIsRestoredEmployee] = useState(false); //koristi se za re-render tabele nakon vraćanja zaposlenih
        
        const [isEmployeeRestoreClicked, setIsEmployeeRestoreClicked] = useState(false); //koristi se za prikaz obrisanih zaposlenih

        const api_url = process.env.REACT_APP_API_URL;
        
        const [rows, setRows] = useState([]); //koristi se za tabelu
        const [columns, setColumns] = useState([]); //koristi se za tabelu

        const { enqueueSnackbar } = useSnackbar();

       
        const showSnackbarMessage = (variant, message) => () => {
            // variant could be success, error, warning, info, or default
            enqueueSnackbar(message, {
                variant,
                autoHideDuration: 3000,
                anchorOrigin: { vertical: "top", horizontal: "center" }, //snackbar position
            });
        };

        const handleSearch = (event) => {
            //pretraga po imenu, prezimenu, broju telefona, teretani, ulozi
            const query = event.target.value;
            setSearchQuery(query); //vrijednost unutar search polja
    
            //filtriramo zaposlene, i postavljamo ih u filteredEmployees (koje renderujemo u tabeli)
            const filtered = employees.filter((employee) => {
                return (
                    employee.Name.toLowerCase().includes(query.toLowerCase()) ||
                    employee.Surname.toLowerCase().includes(query.toLowerCase()) ||
                    employee.Phone.includes(query) ||
                    employee.GymName.toLowerCase().includes(query.toLowerCase()) ||
                    employee.Type.toLowerCase().includes(query.toLowerCase())
                )
    
            });
    
            setFilteredEmployees(filtered);
            
    
            console.log("Search query: ", query);
    
        }

        const [renderNumber, setRenderNumber] = useState(0); //Ovim rješavam problem kad se transakcije dovlače prije zaposlenih što dovodi do greške
        const [lastTransactionFetched, setLastTransatcionFetched] = useState(false);

        useEffect(() => {

            async function fetchEmployees() {
                try {
                    setIsLoading(true);
                    await jwtInterceptor
                        .get(`${api_url}/employee`)//ne treba slati token je ruta javna
                        .then((response) => {
                            console.log("Employees dovucen", response.data);
                            //Dovlačimo sve zaposlene, osim zaposlenog sa ID 1023 
                            //(jer je taj zaposleni rezervisan za Workout tabelu za CUSTOM EVENT) (custom event je zahtijevao da podmetnem nekog zaposlenog)
                            setEmployees(response.data.filter((employee) => employee.ID !== 1023)); 
                            setRenderNumber((prev) => prev + 1);
                        })
                        .catch((err) => {
                            showSnackbarMessage("error", `Greška prilikom dovlačenja zaposlenih!`)();
                            console.log(err);
                        })
                        .finally(() => {
                            //loading se završava tek kad se dovuku transakcije
                            // setIsLoading(false); //na kraju fetcha, postavljamo isLoading na false
                            setIsRestoredEmployee(false); 
                        });
                    } catch (err) {
                        showSnackbarMessage("error", `Greška prilikom dovlačenja zaposlenih!`)();
                        console.log(err);
                    }
            }
                
            fetchEmployees();
        }, [isRestoredEmployee]);
            
        useEffect(() => {
            //dovlači posljednju transakciju za svakog zaposlenog (da bi se znalo da li je isplaćena plata za taj mjesec)
            //u dependency array je dodat isSalaryPaid, jer se nakon uplate plate, re-renderuje tabela (a ovaj dio koda postavlja posljednju uplatu)
            if(renderNumber === 0 && !employees) return; //ako je renderNumber 0, to znači da se prvi put renderuje tabela, i da još nijesu dovučeni zaposleni

            async function fetchLastTransaction() {
                try {
                    setIsLoading(true);
    
                    const transactionsResponse = await jwtInterceptor.get(`${api_url}/transaction/latest`, { withCredentials: true })
                        
                    if(!transactionsResponse || !transactionsResponse.data ){
                        console.log("GRESKA KOD TRANSAKCIJA");
                        return;
                    }

                    setEmployees((prevEmployees) => {
                        //dodajemo posljednju transakciju svakom zaposlenom
                        return prevEmployees.map((employee) => {

                            const lastTransaction = transactionsResponse.data.find((transaction) => transaction.FK_EmployeeID === employee.ID);
                            
                            console.log("LAST TRANSACTION: ", lastTransaction, moment().diff(employee.LastTransactionDate, 'months'));
                            return {
                                ...employee, //zadržavamo sve prethodne vrijednosti i dodajemo posljednju transakciju
                                LastTransactionDate: lastTransaction ? lastTransaction.Date : null, //null može biti ako tek dodamo zaposlenog, ili ako ga izrabljavamo :)
                            };
                        });
                    })

                    } catch (err) {
                        showSnackbarMessage("error", `Greška prilikom dovlačenja posljednje transakcije!`)();
                        console.log(err);
                    } finally {
                        setLastTransatcionFetched(true); //ovo postavljamo na true, da bi se tek nakon ovoga dozvolio re-render tabele  (useEffect ispod)
                        // setIsLoading(false); //na kraju fetcha, postavljamo isLoading na false
                    }
            }
    
            fetchLastTransaction();
            //isRestoredEmployee je dodat u dependency array, jer se nakon vraćanja zaposlenog,
            // re-renderuje tabelu (a ovaj dio koda postavlja posljednju isplatu)
        }, [renderNumber, isSalaryPaid, isRestoredEmployee]);
        
    


        useEffect(() => {
            if(!employees || !lastTransactionFetched) return;
            //kad se dovuče data, i kad se promijeni filteredEmployee ili kad se isplati zarada, radi se re-render
            //za re-render usljed isplate zarade, je odgovoran useEffect iznad
            setIsLoading(true);
            try {
                setRowsData();
                setColumnsData();
            } catch (err) {
                console.log(err);
            } finally {
                setIsLoading(false); //na kraju renderovanja tabele, postavljamo isLoading na false
            }

        }, [employees, filteredEmployees, isSalaryPaid, lastTransactionFetched]);
        

        //rows i colums se prosljeđuju u tabelu
        const setRowsData = () => {
            //ako nijesmo ništa pretraživali, prikazujemo sve članove, inače prikazujemo filtrirane članove
            let displayArray = filteredEmployees ? filteredEmployees : employees;
            console.log( filteredEmployees ? "DISPLAY FILTERED EMPLOYEES: " : "DISPLAY EMPLOYEES: ");
            
            if (displayArray === undefined || displayArray === null || !employees) {
                //ovo je dodato jer nekad pukne program, jer employees bude prazan
                console.log("Prazan employees, vracam null");
                showSnackbarMessage("error", `Greška prilikom dovlačenja zaposlenih!`)();
                return {};
            }
            
            setRows(displayArray.map((employee, index) => {
                //određujemo koji će se podaci prikazati u tabeli
                console.log("EMPLOYEE: ", employee);
                return {
                    ...employee,
                    id: index + 1, //NE DIRAJ; id je redni broj člana, (CASE SENSITIVE )
                    FullName: `${employee.Name} ${employee.Surname}`,
                    Salary: `${employee.Salary} €`,
                    LastTransactionDate: employee.LastTransactionDate 
                                        ?  
                                        `${moment(employee.LastTransactionDate).format("DD.MM.YYYY. HH:mm:ss")}` 
                                        : 'Nema transakcija!'  // ako tek dodamo zaposlenog, ili ako ga izrabljavamo :)
                }; 
            })
            );
        };

        const setColumnsData = () => {
            //
            setColumns([
                //field je vrijednost koja se nalazi u objektu koji se nalazi u rows, i mora biti identičan sa tom vrijednošću
                { field: "id", headerName: "No.", width: 40 },
                {
                    field: "FullName", //Name + Surname (definisano u rows)
                    headerName: "Zaposleni",
                    width: 190,
                    renderCell: (params) => {
                        const employee = params.row; //sadrži sve informacije o zaposlenom u tom redu
                        // console.log("Employee RED: ", employee);
                        return (
                            <div style={{ display: "flex", alignItems: "center" }}>
                                {/* Avatar komponenta se koristi da bi tabela renderovala sliku */}
                                <Avatar alt={`${employee.Name}`} src={`${api_url}/uploads/${employee.Picture}`}/>  
                                {/* alt (ako nema slike, uzima početno slovo imena) */}
                                <div style={{ marginLeft: "10px" }}>
                                    {employee.Name} {employee.Surname}
                                </div>
                            </div>
                        );
                    },
                },
                {
                    field: "Phone",
                    headerName: "Broj telefona",
                    width: 100,
                },
                {
                    field: "GymName",
                    headerName: "Teretana",
                    width: 120,
                },
                {
                    field: "Type",
                    headerName: "Uloga",
                    width: 120,
                },
                {
                    field: "Salary",
                    headerName: "Plata",
                    width: 100,
                },
                {
                    field: "LastTransactionDate",
                    headerName: "Posljednja isplata",
                    width: 170,
                },
                {
                    field: "PaySalary",
                    headerName: "Isplati",
                    width: 70,
                    renderCell: (params) => {
                        const employee = params.row; //sadrži sve informacije o zaposlenom u tom redu
                        //ako je prošlo više od mjesec dana od posljednje isplate, prikazuje se dugme za isplatu
                        const lastTransactionReformatted = moment(employee.LastTransactionDate).format("DD MM YYYY"); 
                        //neophodno je da reformatiramo datum, jer je u tabeli prikazan (DD.MM.YYYY. HH:mm:ss)

                        const atLeastMonthPassed = moment().diff(lastTransactionReformatted, 'months') ||
                                                employee.LastTransactionDate === "Nema transakcija!" ? true : false;

                        return (
                            <div style={{ display: "flex", alignItems: "center" }}>

                                <IconButton
                                    aria-label="Check In"
                                    disabled={!atLeastMonthPassed} //ako je plata isplaćena ovog mjeseca, dugme je disabled
                                    onClick={handleSalaryPay(employee)} //predajemo objekat zaposlenog koji će da se šalje
                                >
                                    <PaidOutlinedIcon
                                        style={{ color: atLeastMonthPassed ? "green" : "grey" }} 
                                    />
                                </IconButton>

                            </div>
                        );
                    },
                },
                {
                    field: "Edit",
                    headerName: "Izmijeni",
                    width: 70,
                    renderCell: (params) => {
                        const employee = params.row; //sadrži sve informacije o zaposlenom u tom redu
                        return (
                            <div style={{ display: "flex", alignItems: "center" }}>

                                <IconButton
                                    aria-label="Edit"
                                    onClick={() => handleEditEmployee(employee)} //otvara Edit komponentu i prosljeđuje zaposlenog koji se edituje
                                    //arrow funkcija potrebna da se ne bi odmah pokrenula funkcija (radi se bind)
                               >  
                                    <EditIcon sx={{color: 'green'}}/>
                                </IconButton>

                            </div>
                        );
                    },
                },
                {
                    field: "Obrisi",
                    headerName: "Obriši",
                    width: 70,
                    renderCell: (params) => {
                        const employee = params.row; //sadrži sve informacije o zaposlenom u tom redu
                        return (
                            <div style={{ display: "flex", alignItems: "center" }}>

                                <IconButton
                                    aria-label="Delete"
                                    onClick={()=> handleDeleteEmployee(employee)} //otvara Dialog komponentu i prosljeđuje zaposlenog
                                    //arrow funkcija potrebna da se ne bi odmah pokrenula funkcija (radi se bind)
                               >  
                                    <PersonRemoveIcon sx={{color: 'red'}}/>
                                </IconButton>

                            </div>
                        );
                    },
                }
                
            ]);
            
        } 

        

        const handleSalaryPay = (employee) => async () => {
            console.log("HANDLE PAY, Isplata plate za zaposlenog: ", employee);
            
            setTransactionInfo(
                {   
                    transaction: {//koji sadrži informacije o transakciji (jedino se on šalje na server)
                        Amount: employee.Salary,
                        Date: moment().format("YYYY-MM-DD HH:mm:ss"),
                        Type: "Isplata plate",
                        FK_TransactionTypesID: 2, //Isplata plate
                        FK_EmployeeID: employee.ID,
                        Description: `${employee.Name} ${employee.Surname} - Isplata plate za mjesec `  + moment().format("MMMM") + " " + moment().format("YYYY") + ". godine",
                    },
                    employee: employee, //koristi se za prikaz success i error poruka u dialogu
                }
            );
            
            handleDialogOpen();
        };

        const handleDialogOpen = () => {
            setIsDialogOpened(true);
        };

        const handleDialogClose = () => {
            setIsDialogOpened(false);
            setTransactionInfo(null); //resetujemo objekat za transakciju
            setIsSalaryPaid(false); //resetujemo stanje za re-render tabele (za svaki slucaj)
            setDeleteButtonClicked(false); //resetujemo stanje za brisanje zaposlenog
            setEmployeeToBeDeleted(null); //resetujemo stanje za brisanje zaposlenog
        };

        const getEmployeeRoleData = async (employee) => {
            setIsLoading(true);
            const response = await jwtInterceptor.get(`${api_url}/employee/role/${employee.ID}`)
            setIsLoading(false);

            console.log("Stigli podaci", response.data);
            return {
                ...employee,
                Email: response.data ? response.data.Email : null,
                FK_EmployeeID: response.data ? response.data.FK_EmployeeID : null, //iako je isti kao obični ID zaposlenog, ovako mi je lakše jer ovo šaljem u EditPersonalInfo komponentu
              };
        }
        const handleEditEmployee = async (editEmployee) => {
            console.log("Edit zaposlenog POKRENUT", editEmployee);
            const newEditEmployee = await getEmployeeRoleData(editEmployee); //dodaje na editEmployee objekat Email zaposlenog (potrebno za editovanje)
            console.log("Edit zaposlenog ZAVRSEN", newEditEmployee);
            props.handleEditOpen(true, newEditEmployee); //otvara Edit komponentu i prosljeđuje zaposlenog koji se edituje
        }
         
        const handleDeleteEmployee = (employee) => {
            console.log("Brisanje zaposlenog POKRENUTO", employee);
            setDeleteButtonClicked(true);
            setIsDialogOpened(true);
            setEmployeeToBeDeleted(employee);

        }

        const handleAgree = async () => {        
            console.log("Isplata plate ");
            try {
                if(!isDialogOpened || !transactionInfo) return;

                setIsLoading(true);

                let success = false;
                await jwtInterceptor
                    .post(`${api_url}/transaction`, transactionInfo['transaction'], {
                        withCredentials: true
                    })
                    .then((response) => {
                        console.log("Isplata plate, RES DATA: ", response.data);
                        success = true;
                        showSnackbarMessage("success", `Iznos od ${transactionInfo["employee"].Salary} je uspješno prebačen na račun zaposlenog: ${transactionInfo["employee"].Name} ${transactionInfo["employee"].Surname}!`)();
                    })
                    .catch((err) => {
                        console.log("Isplata plate: ", err);
                        showSnackbarMessage("error", `Greška prilikom isplate plate za zaposlenog: ${transactionInfo["employee"].Name} ${transactionInfo["employee"].Surname}!`)();
                    }).finally(() => {
                        if(success) {
                            setIsSalaryPaid(true); //re-renderujemo tabelu
                        }
                        setIsLoading(false);
                        setTransactionInfo(null); //resetujemo objekat za transakciju
                    });

            } catch (err) {
                console.log(err);
            }

            setIsDialogOpened(false);
        };

        const handleAgreeDeleteEmployee = async () => {
            if(!employeeToBeDeleted || !isDialogOpened || !deleteButtonClicked) return;
            console.log("POTVRDA, BRIŠE SE ZAPOSLENI ");
            
            setIsLoading(true);

            jwtInterceptor.put(`${api_url}/employee/delete/${employeeToBeDeleted.ID}`, {}, {withCredentials: true})
                    .then((response) => {
                        console.log("Brisanje zaposlenog, RES DATA: ", response.data);
                        setEmployees((prevEmployees) => {
                            //ažuriramo tabelu, uklanjamo obrisanog zaposlenog
                            return prevEmployees.filter((employee) => employee.ID !== employeeToBeDeleted.ID);
                        })
                        
                        showSnackbarMessage("success", `Zaposleni: ${employeeToBeDeleted.Name} ${employeeToBeDeleted.Surname} je uspješno obrisan!`)();
                    }
                    ).catch((err) => {
                        console.log("Brisanje zaposlenog: ", err);
                        showSnackbarMessage("error", `Greška prilikom brisanja zaposlenog: ${employeeToBeDeleted.Name} ${employeeToBeDeleted.Surname}!`)();
                    }).finally(() => {
                        setIsLoading(false);
                        setEmployeeToBeDeleted(null);
                        setDeleteButtonClicked(false);
                        setIsDialogOpened(false);

                    });

        }

        const handleShowDeletedEmployees = async () => {
            console.log("Prikaz obrisanih zaposlenih");
            //dovlači obrisane zaposlene i otvara Dialog komponentu
            await jwtInterceptor.get(`${api_url}/employee/get/deleted`, {withCredentials: true})
                        .then((response) => {
                            console.log("Obrisani zaposleni: ", response.data);
                            setDeletedEmployees(response.data);
                            setIsEmployeeRestoreClicked(true);

                            setIsDialogOpened(true); //otvara se dialog komponenta, za prikaz zaposlenih
                        })
                        .catch((err) => {
                            console.log("Obrisani zaposleni: ", err);
                            showSnackbarMessage("error", `Greška prilikom dovlačenja obrisanih zaposlenih!`)();
                            return;
                        });



                        
        }

        const handleRegisterOpen = () => {
            console.log("Dodavanje novog zaposlenog");
            // props.mainPage(false); //sakriva Employee komponentu
            props.handleRegisterOpen(true); //Otvaramo Register komponentu
        }


        const handleDialogCloseRESTORE = () => {
            setIsDialogOpened(false);
            setIsEmployeeRestoreClicked(false);
        }

        if (isLoading) {
            return <Loader />
        }


        return (
            <Box sx={{ mt: 4}}>

                <Box sx={{ display: "flex", flexDirection: "row", marginBottom: 0.3 }}>

                    <Input placeholder="Pretraga"
                        sx={{ width: "20%", marginRight: 1 }}
                        value={searchQuery} onChange={handleSearch} 
                        startAdornment={
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        }  
                    />
                    
                    <ButtonIcon 
                        startIcon={<PersonAddIcon />} 
                        label="Dodaj zaposlenog" 
                        handleClick={handleRegisterOpen} 
                    />               
                    
                    <ButtonIcon 
                        startIcon={<HistoryIcon />} 
                        label="Obrisani zaposleni" 
                        style={{position: 'absolute', right: 0}}
                        handleClick={handleShowDeletedEmployees} 
                    /> 
                </Box>  

                <DataTable
                    rows={rows}
                    columns={columns}
                    style={{ width: "100%" }} //visina se automatski podešava (u data-table.js)
                    loading={isLoading}
                    enableCheckbox={true}
                    onRowDoubleClick={(params) => {
                        console.log("Employee", params.row);
                        const employee = params.row;
                        // props.handleEditOpen(true, employee); //otvara Edit komponentu i prosljeđuje zaposlenog koji se edituje
                        handleEditEmployee(employee);
                    }}
                />
                
                {transactionInfo && 
                    <DialogComponent isDialogOpened={isDialogOpened} 
                            handleDialogClose={handleDialogClose} 
                            handleAgree={handleAgree} 
                            handleDisagree={handleDialogClose}
                            dialogTitle={`Isplata plate zarade zaposlenom: 
                                        ${transactionInfo["employee"].Name} ${transactionInfo["employee"].Surname} 
                                        `} 
                            dialogText={`Da li ste sigurni da želite da želite da uplatite ${transactionInfo["employee"].Salary} ?`}
                            disagree="Otkaži"
                            agree="Uplati"
                            disableAgreeBtn={false}
                            disableDisagreeBtn={false}
                />}

                {employeeToBeDeleted && deleteButtonClicked && 
                    <DialogComponent isDialogOpened={isDialogOpened} 
                            handleDialogClose={handleDialogClose} 
                            handleAgree={handleAgreeDeleteEmployee} 
                            handleDisagree={handleDialogClose}
                            dialogTitle={`Brisanje zaposlenog: 
                                        ${employeeToBeDeleted.Name} ${employeeToBeDeleted.Surname} 
                                        `} 
                            dialogText={`Da li ste sigurni da želite da obrišete zaposlenog?`}
                            disagree="Otkaži"
                            agree="Obriši"
                            disableAgreeBtn={false}
                            disableDisagreeBtn={false}
                />}

                {deletedEmployees && isEmployeeRestoreClicked && 
                    <DialogComponent isDialogOpened={isDialogOpened} 
                            handleDialogClose={handleDialogCloseRESTORE} 
                            dialogTitle={`Obrisani zaposleni:`} 
                            dialogText={
                                deletedEmployees.length === 0
                                ? "Nema obrisanih zaposlenih!"
                                :
                                //otvara se komponenta za prikaz liste obrisanih zaposlenih, koje možemo vratiti
                                [<RestoreEmployee deletedEmployees={deletedEmployees} 
                                                setDeletedEmployees={setDeletedEmployees}
                                                setIsLoading={setIsLoading}
                                                showSnackbarMessage={showSnackbarMessage}
                                                setIsRestoredEmployee={setIsRestoredEmployee} //ovo će promijeniti state u useEffectu, i re-renderovati tabelu
                                />] //prikazuje obrisane zaposlene (renderuje se kao niz)
                            }
                            disagree="Otkaži"
                            sxAgree={"display: none"} //ne prikazujem agree button jer ne treba
                            disableAgreeBtn={true}
                            disableDisagreeBtn={false}
                />}
            </Box>
        );

    }

export default EmployeeTable;