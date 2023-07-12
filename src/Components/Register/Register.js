import Stepper from "../../Utilities/Stepper/Stepper";
import { useState } from "react";
import { Link } from "react-router-dom";
import React from "react";
import PersonalInfoRegister from "./Personal-InfoRegister";
import AccountInfoRegister from "./AccountInfoRegister";
import MembershipRegister from "./MembershipRegister";
import "./Register.css";

function Register() {
    const [step, setStep] = useState(0);

    const handleStepValue = () => {
        if (step + 1 <= steps.length) setStep(step + 1);
        else step = steps.length - 1; //because steps start at 0
    };

    const steps = [
        "Enter personal information",
        "Enter account information",
        "Choose a membership",
    ];

    const [client, setClient] = useState({});
    const [role, setRole] = useState({});
    const [workout, setWorkout] = useState({});
    const [membership, setMembership] = useState({});
    const [personalCoach, setPersonalCoach] = useState({});

    const handleClient = (newClient) => {
        setClient(newClient);
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

    return (
        <>
            <h1>Register component</h1>
            <Stepper activeStep={step} steps={steps} />
            <form className="login-container">
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
                    />
                )}
                {step === 1 && (
                    <AccountInfoRegister
                        handleStepValue={handleStepValue}
                        handleRole={handleRole}
                    />
                )}
                {step === 2 && (
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
                    />
                )}

                <Link to={"/register"}>
                    <div className="register-text">
                        <h4>Don't have an account? Register here</h4>
                    </div>
                </Link>
            </form>
        </>
    );
}

export default Register;
