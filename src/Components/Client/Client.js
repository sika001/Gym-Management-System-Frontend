import { useLoaderData } from "react-router-dom";
import clientService from "../../Services/client-service";
import DataTable from "../../Utilities/Data Table/Data-table";

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

export async function loader() {
    const clients = await clientService.getClients();

    return clients;
}

export default Client;
