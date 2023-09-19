import Stepper from "../../Utilities/Stepper/Stepper";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import React from "react";
import PersonalInfoRegister from "./Personal-InfoRegister";
import AccountInfoRegister from "./AccountInfoRegister";
import MembershipRegister from "./MembershipRegister";
import "./Register.css";
import AuthContext from "../Auth Context/AuthContext";

function Register(props) {
    //same register component for both client and employee

    const { user } = useContext(AuthContext); //ulogovani korisnik

    const [step, setStep] = useState(0);

    const handleStepValue = () => {
        if (step + 1 <= steps.length) setStep(step + 1);
        else step = steps.length - 1; //jer koraci pocinju od 0
    };

  
    const stepsClient = [
        "Lični podaci",
        "Informacije o nalogu",
        "Informacije o članarini",
    ];

    const stepsEmployee = [
        "Lični podaci o zaposlenom",
        "Informacije o nalogu",
    ];

    //ako nema ulogovanog korisnika, onda je klijent u pitanju i pokušava da se registruje
    const steps = !user ? stepsClient : stepsEmployee ; //koraci na stepperu

    const [client, setClient] = useState({});
    const [employee, setEmployee] = useState({});
    const [role, setRole] = useState({});
    const [workout, setWorkout] = useState({});
    const [membership, setMembership] = useState({});
    const [personalCoach, setPersonalCoach] = useState({});
    const [gym, setGym] = useState({});


    const handleClient = (newClient) => {
        setClient(newClient);
    };

    const handleEmployee = (newEmployee) => {
        setEmployee(newEmployee);
        console.log("employee", employee);
    };

    const handleRole = (role) => {
        setRole(role);
    };

    const handleWorkout = (workout) => {
        setWorkout(workout);
    };

    const handleMembership = (membership) => {
        setMembership(membership);
    };

    const handlePersonalCoach = (personalCoach) => {
        setPersonalCoach(personalCoach);
    };

    const handleGym = (gym) => {
        setGym(gym);
    };

    return (
        <>
            <h1>Register component</h1>
            <Stepper activeStep={step} steps={steps} />
            {/* <form className="login-container"> */}
            <div className="greeting">
                <h1>
                    Enter {step === 0 ? "personal" : step === 1 ? "account" : "membership"}{" "}
                    information!
                </h1>
            </div>

            {step === 0 && (
                <PersonalInfoRegister
                    handleStepValue={handleStepValue}
                    handleClient={handleClient}
                    handleEmployee={handleEmployee}
                    handleGym={handleGym}
                    isAdmin={user && user.isAdmin ? true : false} //ako je ulogovan i ako je admin
                />
            )}

            {step === 1 && (
                <AccountInfoRegister 
                    handleStepValue={handleStepValue} 
                    handleRole={handleRole} 
                    employee={employee}
                 />
            )}
            
            {/* Prikazuje se samo ako korisnik nije ulogovan, tj. samo ako klijent pokušava da kreira nalog */}
            {step === 2 && !user &&
                <MembershipRegister
                    step={step}
                    handleStepValue={handleStepValue}
                    role={role}
                    client={client}
                    workout={workout}
                    membership={membership}
                    personalCoach={personalCoach}
                    handleRole={handleRole}
                    handleClient={handleClient}
                    handleWorkout={handleWorkout}
                    handleMembership={handleMembership}
                    handlePersonalCoach={handlePersonalCoach}
                    gym={gym}
                    isAdmin={user && user.isAdmin ? true : false} //moram dodati uslov da je user ulogovan
                />
            }
                
            {/* Ako nije ulogovan */}
            {!user && 
             <Link to={"/register"}>
                <div className="register-text">
                    <h4>Don't have an account? Register here</h4>
                </div>
            </Link>}
        </>
    );
}

export default Register;
