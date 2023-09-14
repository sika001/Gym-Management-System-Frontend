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
import dotenv from 'dotenv';
dotenv.config();

function EmployeeTable(props) {
    const [employees, setEmployees] = useState(null); //sadrži sve zaposlene
        const [isLoading, setIsLoading] = useState(true); //koristi se za loading indikator

        const [filteredEmployees, setFilteredEmployees] = useState(); //koristi se za pretragu
        const [isSalaryPaid, setIsSalaryPaid] = useState(false); //pomoću ovoga stanja re-renderujemo tabelu nakom uplate 
        const [isDialogOpened, setIsDialogOpened] = useState(false); //prikazuje Dialog komponentu
        const [transactionInfo, setTransactionInfo] = useState(null); //koristi se za slanje transakcije (isplata plate)
        const [searchQuery, setSearchQuery] = useState(""); //koristi se za pretragu 
      
        const [isEditOpen] = useState(props.isEditOpen); //prikazuje Edit Employee komponentu
        const [isRegisterOpen] = useState(props.isRegisterOpen); //prikazuje Register komponentu
        
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

        useEffect(() => {
            async function fetchEmployees() {
                try {
                    setIsLoading(true);
                    await jwtInterceptor
                        .get(`${api_url}/employee`)//ne treba slati token je ruta javna
                        .then((response) => {
                            console.log("Employees dovucen", response.data);
                            setEmployees(response.data);
                        })
                        .finally(() => {
                            setIsLoading(false); //na kraju fetcha, postavljamo isLoading na false
                        });
                    } catch (err) {
                        showSnackbarMessage("error", `Greška prilikom dovlačenja zaposlenih!`)();
                        console.log(err);
                    }
            }
                
            fetchEmployees();
        }, []);
            
        useEffect(() => {
            //dovlači posljednju transakciju za svakog zaposlenog (da bi se znalo da li je isplaćena plata za taj mjesec)
            //u dependency array je dodat isSalaryPaid, jer se nakon uplate plate, re-renderuje tabela (a ovaj dio koda postavlja posljednju uplatu)
           
            async function fetchLastTransaction() {
                try {
                    setIsLoading(true);
    
                    await jwtInterceptor
                        .get(`${api_url}/transaction/latest`, { withCredentials: true })
                        .then((response) => {
                            console.log("Posljednje transakcije dovucene", response.data);
    
                            setEmployees((prevEmployees) => {
                                //dodajemo posljednju transakciju svakom zaposlenom
                                return prevEmployees.map((employee) => {
                                    const lastTransaction = response.data.find((transaction) => transaction.FK_EmployeeID === employee.ID);
                                    
                                    console.log("LAST TRANSACTION: ", lastTransaction, moment().diff(employee.LastTransactionDate, 'months'));
                                    return {
                                        ...employee, //zadržavamo sve prethodne vrijednosti i dodajemo posljednju transakciju
                                        LastTransactionDate: lastTransaction ? lastTransaction.Date : null, //null može biti ako tek dodamo zaposlenog, ili ako ga izrabljavamo :)
                                    };
                                });
                            })
                        })
                        .finally(() => {
                            setIsLoading(false); //na kraju fetcha, postavljamo isLoading na false
                        });
                    } catch (err) {
                        showSnackbarMessage("error", `Greška prilikom dovlačenja posljednje transakcije!`)();
                        console.log(err);
                    }
            }
    
            fetchLastTransaction();
        }, [isSalaryPaid]);
        
    


        useEffect(() => {
            if(!employees) return;
            //kad se dovuče data, i kad se promijeni filteredEmployee ili kad se isplati zarada, radi se re-render
            //za re-render usljed isplate zarade, je odgovoran useEffect iznad
            try {
                setIsLoading(true);
                setRowsData();
                setColumnsData();
            } catch (err) {
                console.log(err);
            } finally {
                setIsLoading(false); //na kraju renderovanja tabele, postavljamo isLoading na false
            }

        }, [employees, filteredEmployees, isSalaryPaid]);
        

        //rows i colums se prosljeđuju u tabelu
        const setRowsData = () => {
            //ako nijesmo ništa pretraživali, prikazujemo sve članove, inače prikazujemo filtrirane članove
            let displayArray = filteredEmployees ? filteredEmployees : employees;
            console.log( filteredEmployees ? "DISPLAY FILTERED EMPLOYEES: " : "DISPLAY EMPLOYEES: ");
            
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
                                        `${moment(employee.LastTransactionDate).format("DD.MM.YYYY. HH:mm:ss")}h` 
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
                        const atLeastMonthPassed = moment().diff(employee.LastTransactionDate, 'months') >= 1 
                                        || employee.LastTransactionDate === "Nema transakcija!" ? true : false;
                        console.log("Employee RED: ", employee, moment().diff(employee.LastTransactionDate, 'months'));

                        return (
                            <div style={{ display: "flex", alignItems: "center" }}>

                                <IconButton
                                    aria-label="Check In"
                                    disabled={!atLeastMonthPassed} //ako je plata isplaćena ovog mjeseca, dugme je disabled
                                    onClick={handleSalaryPay(employee)} //predajemo objekat zaposlenog koji će da se šalje
                                >
                                    <PaidOutlinedIcon
                                        style={
                                            { color: atLeastMonthPassed ? "green" : "grey" }
                                        } 
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
                                    onClick={()=>handleEditEmployee(employee)} //otvara Edit komponentu i prosljeđuje zaposlenog koji se edituje
                                    //arrow funkcija potrebna da se ne bi odmah pokrenula funkcija (radi se bind)
                               >  
                                    <EditIcon sx={{color: 'green'}}/>
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
        };

        const handleEditEmployee = (editEmployee) => {
            console.log("Edit zaposlenog POKRENUT", editEmployee);
            props.handleEditOpen(true, editEmployee); //otvara Edit komponentu i prosljeđuje zaposlenog koji se edituje
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


        const handleRegisterOpen = () => {
            console.log("Dodavanje novog zaposlenog");
            // props.mainPage(false); //sakriva Employee komponentu
            props.handleRegisterOpen(true); //Otvaramo Register komponentu
        }

        if (isLoading) {
            return <div>Učitavanje...</div>;
        }


        return (
            <Box sx={{ flexGrow: 1}}>

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
                    
                </Box>  

                <DataTable
                    rows={rows}
                    columns={columns}
                    style={{ width: "100%" }} //visina se automatski podešava (u data-table.js)
                    loading={isLoading}
                    enableCheckbox={true}
                    onRowDoubleClick={(params) => {
                        console.log("Employee", params.row);
                        props.handleEditOpen(true);
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

            </Box>
        );

    }

export default EmployeeTable;