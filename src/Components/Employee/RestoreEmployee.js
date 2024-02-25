import { Box } from '@mui/system';
import { Avatar } from '@mui/material';
import ButtonIcon from '../../Utilities/Button/Button';
import jwtInterceptor from '../../Utilities/Interceptors/jwtInterceptor';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

function RestoreEmployee(props){
    const api_url = process.env.REACT_APP_API_URL;    

    //Vraća niz zaposlenih koji su obrisani (renderuje se kao niz)
    return props.deletedEmployees.map((employee, i) => {
        return <Box sx={{
                        display: 'flex', 
                        flexDirection: 'row', 
                        fontSize: 18, 
                        mt: 1,                                                    // minWidth: '200%',
                        alignItems: 'center', // vertikalno ih poravnava
                        justifyContent: 'space-between', // horizontalno ih poravnava
                    }}
                    key={i}
                >
            {/* redni broj, slika, ime i prezime */}
            {i+1}. 
            <Avatar alt={`${employee.Name}`} 
                    src={`${api_url}/uploads/${employee.Picture}`}
                    sx={{width: 28, height: 25, ml: 1, mr: 1}}  
            /> 
            {employee.Name} {employee.Surname}
            {/* dugme za vraćanje zaposlenog */}
            <Box> 
                {/* Ovaj dodatni box što sam dodao je bitan da bi dugme VRATI 
                ostalo skroz desno (gore je justify-content: space-between)
                */}
                <ButtonIcon startIcon={< RestoreFromTrashIcon/>} 
                            label="Vrati"
                            handleClick={() => {
                                props.setIsLoading(true);
                                console.log("Vraćanje zaposlenog: ", employee);
                                jwtInterceptor.put(`${api_url}/employee/restore/${employee.ID}`, {}, {withCredentials: true})
                                            .then((response) => {
                                                console.log("Vraćanje zaposlenog, RES DATA: ", response.data);
                                                //nakon uspješnog vraćanja, uklanjamo zaposlenog iz niza obrisanih (jer više nije obrisan)
                                                props.setDeletedEmployees((prevEmployees) => prevEmployees.filter((prevE) => prevE.ID !== employee.ID));

                                                props.showSnackbarMessage("success", `Zaposleni: ${employee.Name} ${employee.Surname} je uspješno vraćen!`)();
                                              
                                                //nakon uspješnog vraćanja, (pošto može biti više zaposlenih), na close dialoga, ažuriramo tabelu
                                                props.setIsRestoredEmployee(true); //OVO UZROKUJE DA SE OPET IZVRŠI USEEFFECT U EMPLOYEETABLE I RE-RENDERUJE TABELA
                                            
                                            }
                                            ).catch((err) => {
                                                console.log("Vraćanje zaposlenog: ", err);
                                                props.showSnackbarMessage("error", `Greška prilikom vraćanja zaposlenog: ${employee.Name} ${employee.Surname}!`)();
                                            }).finally(() => {
                                                props.setIsLoading(false);
                                            });
                                            
                            }}
                 />
            </Box>
        </Box>

    }
    )

}

export default RestoreEmployee;