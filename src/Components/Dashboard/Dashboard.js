import Attendance from "./Attendance/Attendance";
import Payments from "../Account/Payments/Payments";
import { useContext, useState } from "react";
import MembershipInfo from "../Account/Membership Info/MembershipInfo";
import AuthContext from "../Auth Context/AuthContext";
import { Box } from "@mui/material";


function Dashboard(){

    const {user} = useContext(AuthContext); //trenutno ulogvani korisnik

    const [memberships, setMemberships] = useState([]); //contains membership data, coach data, workout data...
    const [isLoading, setIsLoading] = useState(true);

    const handleSetMembership = (membership) => {
        setMemberships(membership); //used to pass data from child to parent
 
    };

    return(
        <>
            {/* Prikaz prisustva i informacija o clanarini (različito za korisnika i zaposlene) */}
            <Box sx={{display: 'flex', flexDirection: 'column', 

                    }}>
                <Attendance memberships={memberships} 
                            setMemberships={handleSetMembership} 
                            isLoading={isLoading} 
                            setIsLoading={setIsLoading}  
                />

                {user.isClient === 1 &&
                    <MembershipInfo memberships={memberships}
                        isLoading={isLoading} 
                        setIsLoading={setIsLoading}
                    />
                }
            </Box>
            {/* Transakcije */}
            <Box>
                <Payments memberships={memberships} 
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                />
            </Box>
        </>
    )
}

export default Dashboard;