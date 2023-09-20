import dashboardPhoto1 from "../../images/SideBar/dashboard.png";
import "./side-bar.css";
import dashboardPhoto2 from "../../images/SideBar/dashboard (1).png";
import members1 from "../../images/SideBar/team.png";
import members2 from "../../images/SideBar/team (1).png";
import account1 from "../../images/SideBar/profile.png";
import account2 from "../../images/SideBar/profile2.png";
import schedule1 from "../../images/SideBar/schedule.png";
import schedule2 from "../../images/SideBar/schedule (1).png";
import employees1 from "../../images/SideBar/consultant.png";
import employees2 from "../../images/SideBar/consultant (1).png";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import Logout from "../Login/Logout";
import AuthContext from "../Auth Context/AuthContext";

function SideBar() {
    const [isHoveredDashboard, setIsHoveredDashboard] = useState(true);
    const [isHoveredMembers, setIsHoveredMembers] = useState(true);
    const [isHoveredAccount, setIsHoveredAccount] = useState(true);
    const [isHoveredSchedule, setIsHoveredSchedule] = useState(true);
    const [isHoveredEmployees, setIsHoveredEmployees] = useState(true);
    const [isHoveredLogout, setIsHoveredLogout] = useState(true);

    const {user} = useContext(AuthContext);

    const handleHoverDashboard = () => {
        setIsHoveredDashboard(!isHoveredDashboard);
    };
    const handleHoverMembers = () => {
        setIsHoveredMembers(!isHoveredMembers);
    };
    const handleHoverAccount = () => {
        setIsHoveredAccount(!isHoveredAccount);
    };
    const handleHoverSchedule = () => {
        setIsHoveredSchedule(!isHoveredSchedule);
    };
    const handleHoverEmployees = () => {
        setIsHoveredEmployees(!isHoveredEmployees);
    };
    const handleHoverLogout = () => {
        setIsHoveredLogout(!isHoveredLogout);
    };

    return (
        user &&  //renderujemo sidebar samo ako je korisnik ulogovan
        <>
        <aside className="aside-container">
            <Link to={"/dashboard"} className="link-container">
                <div
                    className="dashboard"
                    onMouseEnter={handleHoverDashboard}
                    onMouseLeave={handleHoverDashboard}
                    >
                    <img
                        src={isHoveredDashboard ? dashboardPhoto1 : dashboardPhoto2}
                        alt="dashboard-icon"
                        />

                    <div className="text">Početna</div>
                </div>
            </Link>

            <Link to={"/schedule"} className="link-container">
                <div
                    className="schedule"
                    onMouseEnter={handleHoverSchedule}
                    onMouseLeave={handleHoverSchedule}
                    >
                    <img src={isHoveredSchedule ? schedule1 : schedule2} alt="schedule-icon" />
                    <div className="text">Raspored</div>
                </div>
            </Link>

            <Link to={"/members"} className="link-container">
                <div
                    className="members"
                    onMouseEnter={handleHoverMembers}
                    onMouseLeave={handleHoverMembers}
                    >
                    <img src={isHoveredMembers ? members1 : members2} alt="members-icon" />
                    <div className="text">Članovi</div>
                </div>
            </Link>

            <Link to={"/employees"} className="link-container">
                <div
                    className="employees"
                    onMouseEnter={handleHoverEmployees}
                    onMouseLeave={handleHoverEmployees}
                >
                    <img src={isHoveredEmployees ? employees1 : employees2} alt="employees-icon" />
                    <div className="text">Zaposleni</div>
                </div>
            </Link>

            <Link to={"/account"} className="link-container">
                <div
                    className="account"
                    onMouseEnter={handleHoverAccount}
                    onMouseLeave={handleHoverAccount}
                    >
                    <img src={isHoveredAccount ? account1 : account2} alt="account-icon" />
                    <div className="text">Profil</div>
                </div>
            </Link>

            
            <Link to={"/logout"} className="link-container">
                <div className="logout"
                    onMouseEnter={handleHoverLogout}
                    onMouseLeave={handleHoverLogout}  
                    >
                    <Logout isHoveredLogout={isHoveredLogout} />
                </div>
            </Link>
        </aside>
    </>
    );
}

export default SideBar;
