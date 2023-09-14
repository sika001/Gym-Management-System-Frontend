import Attendance from "./Attendance/Attendance";
import Payments from "../Account/Payments/Payments";
import { useState } from "react";
import MembershipInfo from "../Account/Membership Info/MembershipInfo";


function Dashboard(){

    const [memberships, setMemberships] = useState([]); //contains membership data, coach data, workout data...
   
    const handleSetMembership = (membership) => {
        setMemberships(membership); //used to pass data from child to parent
 
    };

    return(
        <div className="dashboard-container">
            <h1>Dashboard</h1>
            <Attendance memberships={memberships} setMemberships={handleSetMembership} />
            <MembershipInfo memberships={memberships} />
            <Payments memberships={memberships} />
        </div>
    )
}

export default Dashboard;