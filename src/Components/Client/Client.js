import { useLoaderData } from "react-router-dom";
import DataTable from "../../Utilities/Data Table/Data-table";
import axios from "axios";
import environment from "../../environment";

function Client() {
    //OVO NAPRAVITI DA RADI
    const clients = useLoaderData();
    console.log(clients);
    return (
        <div>
            <DataTable data={clients} />
        </div>
    );
}

const api_url = environment.api_url;

export async function loader() {
    //PROVJERITI RADI LI
    try {
        const response = await axios.get(`${api_url}/client`);

        return response.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export default Client;
