import "./side-bar.css";
import dashboardPhoto1 from "../../images/SideBar/dashboard.png";
import dashboardPhoto2 from "../../images/SideBar/dashboard (1).png";
import members1 from "../../images/SideBar/team.png";
import members2 from "../../images/SideBar/team (1).png";
import membership1 from "../../images/SideBar/membership.png";
import membership2 from "../../images/SideBar/membership (1).png";
import account1 from "../../images/SideBar/profile.png";
import account2 from "../../images/SideBar/profile2.png";
import { useState } from "react";
import { Link } from "react-router-dom";

function SideBar() {
    const [isHoveredDashboard, setIsHoveredDashboard] = useState(true);
    const [isHoveredMembers, setIsHoveredMembers] = useState(true);
    const [isHoveredMembership, setIsHoveredMembership] = useState(true);
    const [isHoveredAccount, setIsHoveredAccount] = useState(true);

    const handleHoverDashboard = () => {
        setIsHoveredDashboard(!isHoveredDashboard);
    };
    const handleHoverMembers = () => {
        setIsHoveredMembers(!isHoveredMembers);
    };
    const handleHoverMembership = () => {
        setIsHoveredMembership(!isHoveredMembership);
    };
    const handleHoverAccount = () => {
        setIsHoveredAccount(!isHoveredAccount);
    };

    return (
        <aside className="aside-container">
            <Link to={"/"} className="link-container">
                <div
                    className="dashboard"
                    onMouseEnter={handleHoverDashboard}
                    onMouseLeave={handleHoverDashboard}
                >
                    <img
                        src={isHoveredDashboard ? dashboardPhoto1 : dashboardPhoto2}
                        alt="dashboard-logo"
                    />

                    <div className="text">Dashboard</div>
                </div>
            </Link>

            <Link to={"/members"} className="link-container">
                <div
                    className="members"
                    onMouseEnter={handleHoverMembers}
                    onMouseLeave={handleHoverMembers}
                >
                    <img src={isHoveredMembers ? members1 : members2} alt="dashboard-logo" />
                    <div className="text">Members</div>
                </div>
            </Link>

            <Link to={"/"} className="link-container">
                <div
                    className="memberships"
                    onMouseEnter={handleHoverMembership}
                    onMouseLeave={handleHoverMembership}
                >
                    <img
                        src={isHoveredMembership ? membership1 : membership2}
                        alt="dashboard-logo"
                    />
                    <div className="text">Memberships</div>
                </div>
            </Link>

            <Link to={"/"} className="link-container">
                <div
                    className="account"
                    onMouseEnter={handleHoverAccount}
                    onMouseLeave={handleHoverAccount}
                >
                    <img src={isHoveredAccount ? account1 : account2} alt="dashboard-logo" />
                    <div className="text">Account</div>
                </div>
            </Link>
        </aside>
    );
}

export default SideBar;
