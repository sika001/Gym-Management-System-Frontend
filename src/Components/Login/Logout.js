import { useContext } from "react";
import ButtonIcon from "../../Utilities/Button/Button";
import liftIcon from "../../images/lift.png";
import AuthContext from "../Auth Context/AuthContext";

function Logout() {
    const { logout } = useContext(AuthContext);

    return (
        <>
            <ButtonIcon label="Logout" icon={<img src={liftIcon} />} handleClick={logout} />
        </>
    );
}

export default Logout;
