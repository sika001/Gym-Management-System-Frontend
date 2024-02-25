import { useEffect, useState } from "react";
import EditPersonalInfo from "../EditPersonal_Info/EditPersonalInfo";
import CenteredTabs from "../../Utilities/Tabs/Tabs";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import Loader from "../../Utilities/Loader/Loader";
import EditEmployeeRole from "./EditEmployeeRole";

function EditEmployee(props){
    const [employee] = useState(props.editEmployee); //zaposleni koji se edituje

    const [isLoading, setIsLoading] = useState(true);
    
    const tabs = [
        //niz nizova gdje je prvi element string koji se prikazuje na tabu, a drugi je ikonica
        ["Lični podaci o zaposlenom", <AccountCircleIcon sx={{fontSize: 25, mr: 1}} />], //sa fontSize se ovdje mijenja velicina ikonice
        ["Informacije o nalogu", <InfoIcon sx={{fontSize: 25, mr: 1}} />],
    ];
    

    const [currentTabNumber, setCurrentTabNumber] = useState(0); //redni broj taba koji je kliknut (0 je prvi tab)

    const handleCurrentTabNumber = (tabNumber) => {
        setCurrentTabNumber(tabNumber);
        console.log("TAB BROJ:", tabNumber);
    };

    useEffect(() => {
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <Loader />;
    }
    
    return(
        <div>
            <h1>Edit Employee</h1>

            <CenteredTabs tabs={tabs} 
                        handleCurrentTabNumber={handleCurrentTabNumber}
                        currentTab={currentTabNumber}       
            />

            {currentTabNumber === 0 
                    && <EditPersonalInfo isEditingEmployee={true} employee={employee}/>
            }
            {currentTabNumber === 1 
                    && <EditEmployeeRole employee={employee} />                   
            }
            
           
        </div>
    )
}

export default EditEmployee;