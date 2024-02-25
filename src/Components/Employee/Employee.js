import { Box } from "@mui/material";
import Register from "../Register/Register";
import EmployeeTable from "./EmployeeTable";
import { useState } from "react";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ButtonIcon from "../../Utilities/Button/Button";
import EditEmployee from "./EditEmployee";

function Employee() {    
    const [isRegisterOpen, setIsRegisterOpen] = useState(false); //prikazuje Register komponentu
    const [isEditOpen, setIsEditOpen] = useState(false); //prikazuje Edit komponentu
    
    const [editEmployee, setEditEmployee] = useState({}); //zaposleni koji se edituje

    const handleRegisterOpen = (value) => {
        console.log("handleRegisterOpen", value);
        setIsRegisterOpen(value);
    }

    const handleEditOpen = (value, editEmployee) => {
        //edit employee je zaposleni koji se edituje
        console.log("handleEditOpen", value, "editEmployee", editEmployee);
        setIsEditOpen(value);
        setEditEmployee(editEmployee);
    }

    return (
        <Box>
            {
                isRegisterOpen 
                ?
                    <>
                        <ButtonIcon label={"Nazad"} 
                                    startIcon={<ArrowBackIosNewIcon />} 
                                    handleClick={() => handleRegisterOpen(false)} />
                     {/* Kreiranje novog zaposlenog se radi preko Register komponente */}
                        <Register />  
                    </>
                :
                    <>
                        {
                            //Ako nije otvoren Register, onda se proverava da li je otvoren Edit
                            isEditOpen 
                            ?
                                <> 
                                {/* Otvara se komponenta za editovanje zaposlenog */}
                                    <ButtonIcon label={"Nazad"} 
                                                startIcon={<ArrowBackIosNewIcon />} 
                                                handleClick={() => handleEditOpen(false)} />
                                    
                                    <EditEmployee editEmployee={editEmployee} />
                                </>
                            :
                            // Ako nije ni register, ni edit otvoren, prikazuje se tabela sa zaposlenima
                                <EmployeeTable isRegisterOpen={isRegisterOpen} // Tabela sa zaposlenima
                                    handleRegisterOpen={handleRegisterOpen}
                                    isEditOpen={isEditOpen}
                                    handleEditOpen={handleEditOpen}
                                />
                        }
                  </>
                   
            }
    
        </Box>
    );
}

export default Employee;
