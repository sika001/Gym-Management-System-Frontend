import { useLoaderData } from "react-router-dom";
import DataTable from "../../Utilities/Data Table/Data-table";
import moment from "moment";
import environment from "../../environment";
import { useEffect } from "react";
import jwtInterceptor from "../../Utilities/Interceptors/jwtInterceptor";

const api_url = environment.api_url;

export async function loader() {
    try {
        const response = await jwtInterceptor.get(`${api_url}/membership`, {
            withCredentials: true,
        });
        console.log("response", response.data);
        return response.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

function Members() {
    const members = useLoaderData(); //fetches data from loader function

    const updateExpiredMemberships = async () => {
        try {
            const response = await jwtInterceptor.put(`${api_url}/membership`, null, {
                withCredentials: true,
            });
            console.log("Updated expired memberships", response.data);
        } catch (err) {
            console.log("Error while trying to update expired memberships", err);
        }
    };

    useEffect(() => {
        updateExpiredMemberships();
    }, []);

    const rows = members.map((member, index) => {
        const memberAge = calculateAge(member.DateOfBirth);
        const startDate = moment(member.Start).format("DD/MM/YYYY");
        const expiresIn = moment(member.End).diff(member.Start, "days"); //number of days until membership expires
        return {
            ...member,
            id: index + 1,
            Age: memberAge,
            Start: startDate,
            "Valid (days)": expiresIn,
            // Status: expiresIn > 0 ? "Active" : "Expired",
        }; //dodajemo id da bi mogli prikazati redni broj, a ostalo sve iz members ostaje isto
    });
    //rows and cols are passed as props to DataTable component
    const columns = [
        //field names must be the same as the names of the properties in the object
        { field: "id", headerName: "No.", width: 70 },
        { field: "Name", headerName: "Name", width: 130 },
        { field: "Surname", headerName: "Surname", width: 130 },
        {
            field: "Age",
            headerName: "Age",
            width: 90,
        },
        {
            field: "Phone",
            headerName: "Phone",
            width: 130,
        },
        {
            field: "Workout Name",
            headerName: "Workout Name",
            width: 150,
        },
        {
            field: "Start",
            headerName: "Start",
            width: 130,
        },
        {
            field: "Valid (days)",
            headerName: "Valid (days)",
            width: 130,
        },
        {
            field: "Membership Type",
            headerName: "Membership Type",
            width: 150,
        },
        {
            field: "Status",
            headerName: "Status",
            width: 80,
        },
    ];

    return (
        <div className="members-container">
            <DataTable data={members} rows={rows} columns={columns} />
            <h1>Members</h1>
        </div>
    );
}

const calculateAge = (birthday) => {
    const dateOfBirth = new Date(birthday);
    const currentDate = new Date();

    const ageInMilliseconds = currentDate - dateOfBirth;
    const ageInYears = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25));

    return ageInYears;
};

export default Members;
