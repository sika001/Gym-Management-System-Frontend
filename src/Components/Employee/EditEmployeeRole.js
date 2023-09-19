import { Box, Chip, FormControl, FormHelperText, InputAdornment, InputLabel, Menu, MenuItem, OutlinedInput, Select } from "@mui/material";
import { useEffect, useState } from "react";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor"
import { useSnackbar } from "notistack";
import Input from "@mui/material/Input";
import Loader from "../../Utilities/Loader/Loader";
import { v4 as uuid_v4 } from "uuid";
import ButtonIcon from "../../Utilities/Button/Button";

function EditEmployeeRole(props) {

    const [employee] = useState(props.employee); //zaposleni koji se edituje
    console.log("Employee: ", employee);
    const [allWorkoutPrograms, setAllWorkoutPrograms] = useState(null); //svi treninzi [individualni i grupni]

    const [isLoading, setIsLoading] = useState(true); //loading indikator
    
    const { enqueueSnackbar } = useSnackbar();

    const showSnackbarMessage = (variant, message) => () => {
        // variant može biti: success, error, warning, info
        enqueueSnackbar(message, {
            variant,
            autoHideDuration: 2000,
            anchorOrigin: { vertical: "top", horizontal: "center" }, //pozicija snackbar poruke
        });
    };
    

    const api_url = process.env.REACT_APP_API_URL;

    const [employeeTypes, setEmployeeTypes] = useState(null); //svi tipovi zaposlenih

    const [selectedEmployeeType, setSelectedEmployeeType] = useState(employee.FK_EmployeeTypeID); //selektovani tip zaposlenog

    //ne treba dodatna funkcija da povlači platu, jer se nalazi u employee.Salary u obliku npr. '900 €'
    //potrebno je samo izvaditi broj iz stringa (razdvojiti po praznom prostoru i parsirati string u int)
    const [salary, setSalary] = useState(parseInt(employee.Salary.split(" ")[0]) || 450);
    const [employeePrice, setEmployeePrice] = useState(0); //cijena treninga koju zaposleni postavlja (ako je individualni trening)

    const [employeeWorkoutPrograms, setEmployeeWorkoutPrograms] = useState(null); //treninzi koje vodi zaposleni (individualni i grupni) [objekti
    const [selectedWorkouts, setSelectedWorkouts] = useState([]);

    const handleEmployeeTypeChange = (event) => {
        //mijenja ulogu zaposlenog
        console.log("Employee type: ", event.target.value);
        setSelectedEmployeeType(event.target.value);        
        
    };

    const handleWorkoutChange = (event) => {
        //mijenja treninge koje vodi zaposleni
        console.log("Workout change: ", event.target.value);
        setSelectedWorkouts(event.target.value);
    };

    const handleSubmit = () => {
        editEmployeeRoleAndSalary();
        createNewWorkouts();
        deleteOldWorkoutsIfNeeded();
    }

    const editEmployeeRoleAndSalary = () => {
         //Mijenja ulogu zaposlenog i platu
         jwtInterceptor.put(`${api_url}/employee/${employee.ID}`, 
         {   //šaljemo samo ono sto se mijenja
             FK_EmployeeTypeID: selectedEmployeeType,
             Salary: salary,
         }, {withCredentials: true})
         .then((response) => {
             console.log("Edit employee role response: ", response.data);
             
             //ako je admin mijenja sam sebi podatke (ako je admin ujedno i trener),
             // moramo da ažuriramo i podatke u local storage-u (jer je trenutno ulogovan)
             if(employee.ID === JSON.parse(localStorage.getItem("userProfile")).ID) {
                 let userDataLocStrg = JSON.parse(localStorage.getItem("userProfile"));
 
                 userDataLocStrg.FK_EmployeeTypeID = selectedEmployeeType;
                 userDataLocStrg.Type = employeeTypes.find((employeeType) => employeeType.ID === selectedEmployeeType).Type;
                 userDataLocStrg.Salary = salary;
 
                 localStorage.removeItem("userProfile"); 
                 //uklanjamo stari objekat iz local storage-a i postavljamo novi sa novim podacima o FK_EmployeeTypeID,Type i Salary
 
                 localStorage.setItem("userProfile", JSON.stringify(userDataLocStrg));
             }
 
             showSnackbarMessage("success", "Uspješna izmjena podataka o ulozi zaposlenog!")();
         })
         .catch((error) => {
             showSnackbarMessage("error", "Greška prilikom izmjene uloge zaposlenog!")();
             console.log("Error: ", error);
         });
    }

    const createNewWorkouts = () => {
        //Kreiranje novih treninga koje vodi zaposleni
        selectedWorkouts.map((workoutProgram) => {

            if(employeeWorkoutPrograms && employeeWorkoutPrograms.find((wrktPrElem) => wrktPrElem.ID === workoutProgram.ID)) {
                //ako je trening vec u bazi, ne treba ga slati
                console.log("Trening je vec u bazi", workoutProgram);
                return;
            }else{
                //ako trening nije u bazi, treba ga dodati
                console.log("Trening nije u bazi, dodajemo ga", workoutProgram);
                jwtInterceptor.post(`${api_url}/workout`, 
                { //kreira se novi trening sa ovim podacima
                    Name: workoutProgram.Name,
                    Type: workoutProgram.Type,
                    GroupSize: workoutProgram.GroupSize,
                    FK_EmployeeID: employee.ID, //Postavljamo da ovaj zaposleni vodi trening
                    EmployeePrice: employeePrice,

                }, {withCredentials: true})
                .then((response) => {
                    console.log("Added workout: ", response.data);
                    showSnackbarMessage("success", "Uspješno dodat trening!")();
                })
                .catch((error) => {
                    showSnackbarMessage("error", "Greška prilikom dodavanja treninga!")();
                    console.log("Error: ", error);
                })
                console.log("Dodaj trening: ", workoutProgram);
            }
            
        })
    }

    const deleteOldWorkoutsIfNeeded = () => {
        //Brisanje treninga koji više nijesu selektovani, a bili su
        employeeWorkoutPrograms && employeeWorkoutPrograms.map((workoutProgram) => {
            if(selectedWorkouts && selectedWorkouts.find((wrktPrElem) => wrktPrElem.ID === workoutProgram.ID)) {
                //ako je trening i dalje selektovan, ne treba ga brisati
                console.log("Trening je i dalje selektovan, ne briše se", workoutProgram);
                return;
            }else{
                //ako trening nije selektovan, treba ga obrisati
                console.log("Trening nije selektovan, brišemo ga", workoutProgram);
                jwtInterceptor.delete(`${api_url}/workout/${workoutProgram.ID}`, {withCredentials: true})
                    .then((response) => {
                        console.log("Deleted workout: ", response.data);
                        showSnackbarMessage("success", "Uspješno obrisan trening!")();
                    })
                    .catch((error) => {
                        showSnackbarMessage("error", "Greška prilikom brisanja treninga!")();
                        console.log("Error: ", error);
                    })
            }
            
        })
    }

    const handleSalaryChange = (event) => {
        //mijenja input polje za platu
        console.log("Plata: ", event.target.value);
        setSalary(event.target.value);
    };

    const handleEmployeePriceChange = (event) => {
        //mijenja input polje za cijenu personalnih treninga
        console.log("Cijena personalnih treninga: ", event.target.value);
        setEmployeePrice(event.target.value);
    };

    useEffect(() => {

        getEmployeeTypes();
        getWorkoutPrograms();

    }, []);

    const getEmployeeTypes = async () => {
        jwtInterceptor.get(`${api_url}/employee/type`)
            .then((response) => {
                console.log("Employee types: ", response.data);
                setEmployeeTypes(response.data);

            })
            .catch((error) => {
                showSnackbarMessage("error", "Greška prilikom učitavanja tipova zaposlenih!")();
                console.log("Error: ", error);
            })
    };

    const [hasWorkouts, setHasWorkouts] = useState(false); //da li zaposleni vodi neki trening
    const getWorkoutPrograms = () => {

        jwtInterceptor.get(`${api_url}/workout`)
            .then((response) => {
                console.log("Workout programs: ", response.data);
                setAllWorkoutPrograms(response.data); //svi treninzi, (treba nam za prikaz u select-u)

                //filtriramo samo treninge koje vodi zaposleni koji se edituje
                const filteredWorkoutPrograms = response.data.filter((workoutProgram) => {
                    return workoutProgram.FK_EmployeeID === employee.ID;
                });

                if(filteredWorkoutPrograms.length > 0) {
                    //ovo je potrebno zbog defaulte vrijednosti u select-u (da bi kontrolisali loader dok se ne postavi selectedWorkouts)
                    setHasWorkouts(true);
                }else{
                    setHasWorkouts(false);
                }

                setEmployeeWorkoutPrograms(filteredWorkoutPrograms); //stari treninzi koje vodi zaposleni (treba nam za submit)
                setSelectedWorkouts(filteredWorkoutPrograms); //treninzi koje vodi zaposleni (treba nam za prikaz u select-u)
            })
            .catch((error) => {
                showSnackbarMessage("error", "Greška prilikom učitavanja treninga!")();
                console.log("Error: ", error);
            }).finally(() => {
                console.log("SELECTED WORKOUTS: ", selectedWorkouts);
                
            }
        );
            
        };

        useEffect(() => {
        if((hasWorkouts && !selectedWorkouts) ||  !allWorkoutPrograms) return;
            //pošto treba malo vremena da se postavi employeeWorkoutPrograms, koristimo useEffect da zaustavimo loader
            // console.log("Employee workout programs: ", employeeWorkoutPrograms, "All workout programs: ", allWorkoutPrograms);
            setIsLoading(false);

    }, [hasWorkouts, selectedWorkouts, allWorkoutPrograms]);

    
    if(isLoading) {
        return <Loader />
    }
    



    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 5, ml: 'auto', mr: 'auto', width: '50%',
        border: '1px solid #ccc', borderRadius: '5px', padding: '20px'
        }} >
            <FormControl sx={{minWidth: '20%'}} >
                {/* biramo vrstu zaposlenog (po defaultu je Coach, tj. prvi element employeeTypes niza) */}
                <InputLabel id="employee-type-label">Uloga zaposlenog</InputLabel>
                <Select onChange={handleEmployeeTypeChange}
                    //selectedEmployeeType je selektovani tip zaposlenog, a ovo sa desne strane || je defaultna vrijednost
                        value={selectedEmployeeType || ""} ///OVO PROMIJENITI JER NE VALJA
                        labelId="employee-type-label"
                        id="employee-type"
                        label="Uloga zaposlenog"
                >
                    {/* Prikazuje sve tipove zaposlenih */}
                    {employeeTypes && employeeTypes.map((employeeType) => (
                        <MenuItem key={employeeType.ID} value={employeeType.ID}>
                            {employeeType.Type}
                        </MenuItem>
                    ))}

                    
                </Select>
            </FormControl>
            
            {/* Odabir zarade zaposlenog */}
            <FormControl sx={{ m: 1, minWidth: '20%', mt: 3 }} variant="outlined">
                <InputLabel htmlFor="salary-amount">Iznos zarade</InputLabel>
                <Input
                    id="salary-amount"
                    endAdornment={<InputAdornment position="end">€</InputAdornment>} //€ na pocetku polja
                    value={salary}
                    onChange={handleSalaryChange}
                />
            </FormControl>

            <FormControl sx={{minWidth: '20%', mt: 3}} >
                {/* Odabir treninga koje vodi zaposleni */}
                {/* Prikazuje chip za treninge koje zaposleni već vodi, a potom može da se doda još treninga */}
                <InputLabel id="demo-multiple-checkbox">Treninzi</InputLabel>
                <Select
                    labelId="demo-multiple-checkbox-label"
                    id="demo-multiple-checkbox"
                    multiple  //kad imamo multiple select, mora biti value niz
                    value={selectedWorkouts || []} //prikazuje treninge koje vodi zaposleni (stare, plus nove) 
                    onChange={handleWorkoutChange}
                    input={<OutlinedInput id="demo-multiple-checkbox" label="Treninzi" />}
                    renderValue={(selected) => {
                        console.log("Employee workout programs: ", selectedWorkouts);
                        return <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((wrktElem) => (
                                <Chip key={uuid_v4()}  //Prikazuje chip za svaki trening koji vodi zaposleni
                                    variant="filled"
                                    label={wrktElem.Name} //ovo je labela koja se prikazuje na chip-u
                                    // deleteIcon={<ClearIcon />} 
                                    // onDelete={()=>console.log("ovaj dio nepotreban");}
                                />
                            ))}
                        </Box>                    
                    }}>
                    {allWorkoutPrograms.map((workoutProgram) => (
                        //Prikazuje listu svih treninga, ali ako je zaposleni trening individualni, 
                        //onda prikaazuje samo onaj trening koji ovaj zaposleni vodi 
                        //(jer postoji više zaposlenih koji vode "Individual Workout")
                        ((workoutProgram.Name !== "Individual Workout") || 
                        (workoutProgram.Name === "Individual Workout" && workoutProgram.FK_EmployeeID === employee.ID))  
                        &&                        
                        <MenuItem key={workoutProgram.ID} value={workoutProgram} sx={{display: 'flex', justifyContent: 'space-between', border: '0.2px solid rgba(233,233,233,0.5)', borderRadius: '1px', padding: '5px'}}
                        // value je objekat, a label iznad uzima samo Name iz tog objekta
                        >
                            {workoutProgram.Name} {workoutProgram.FK_EmployeeID === employee.ID && "(Već vodi ovaj trening)"}
                        </MenuItem>
                    ))}
                </Select>
                        
                <FormHelperText>Odaberite treninge koje vodi zaposleni</FormHelperText>
            </FormControl>

            {/* Odabir cijene personalnih treninga zaposlenog */}
            <FormControl sx={{ m: 1, minWidth: '20%', mt: 3 }} variant="outlined">
                <InputLabel htmlFor="employeePrice-amount">Cijena personalnih treninga</InputLabel>
                <Input
                    id="employeePrice-amount"
                    endAdornment={<InputAdornment position="end">€</InputAdornment>} //€ na pocetku polja
                    value={employeePrice}
                    onChange={handleEmployeePriceChange}
                />
            </FormControl>

            <ButtonIcon label="Sačuvaj izmjene" handleClick={handleSubmit} />
        </Box>
    );
}

export default EditEmployeeRole;