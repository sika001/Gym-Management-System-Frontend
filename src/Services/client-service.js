import enviroment from "../enviroment";

const api_url = enviroment.api_url;

const getClients = async () => {
    const res = await fetch(`${api_url}/client`);
    if (!res.ok) throw Error("Failed to get all clients");

    const data = await res.json();
    return data;
};

export default { getClients };
