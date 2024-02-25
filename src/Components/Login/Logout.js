import { useContext,  } from "react";
import AuthContext from "../Auth Context/AuthContext";
import logoutIcon1 from "../../images/SideBar/logout.png"
import logoutIcon2 from "../../images/SideBar/logout (1).png"
import "../Side Bar/side-bar.css"

function Logout(props) {
    const { logout } = useContext(AuthContext);

    return (
        <>
            <div onClick={logout}>
                <img src={props.isHoveredLogout ? logoutIcon1 : logoutIcon2 }
                    alt="logout-icon"
                    style={{width: '30px', height: '30px'}}
                />
                <div>Izloguj se</div>    
            </div>  
            
        </>
    );
}

export default Logout;
