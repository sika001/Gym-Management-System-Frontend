import Attendance from "./Attendance/Attendance";
import Payments from "./Payments/Payments";
import MembershipInfo from "./Membership Info/MembershipInfo";
import { useContext, useState } from "react";
import AuthContext from "../Auth Context/AuthContext";
import { Box } from "@mui/material";


function Dashboard(){

    const {user} = useContext(AuthContext); //trenutno ulogvani korisnik

    const [memberships, setMemberships] = useState([]); //contains membership data, coach data, workout data...
    const [isLoading, setIsLoading] = useState(true);

    const handleSetMembership = (membership) => {
        setMemberships(membership); //used to pass data from child to parent
 
    };

    const [memBought, setMemBought] = useState(false); //used to force a re-render

    return(
        <>
            {/* Prikaz prisustva i informacija o clanarini (različito za korisnika i zaposlene) */}
            <Box sx={{display: 'flex', flexDirection: 'column', mt: 4}}>
                <Attendance memberships={memberships} 
                            setMemberships={handleSetMembership} 
                            isLoading={isLoading} 
                            setIsLoading={setIsLoading}  
                            memBought={memBought}
                            setMemBought={setMemBought}
                />

                {user.isClient === 1 ?
                    <MembershipInfo memberships={memberships}
                        isLoading={isLoading} 
                        setIsLoading={setIsLoading}
                        memBought={memBought}
                        setMemBought={setMemBought}
                    />
                    : null
                }
            </Box>
            {/* Transakcije */}
            <Box>
                <Payments memberships={memberships} 
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        memBought={memBought}
                        setMemBought={setMemBought}
                />
            </Box>
        </>
    )
}

export default Dashboard;