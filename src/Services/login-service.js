import enviroment from "../enviroment";

const api_url = enviroment.api_url;

const login = async () => {
    const res = await fetch(`${api_url}/login`);

    if (!res.ok) throw Error("Failed to log in");

    const data = res.json();
    return data;
};

export default { login };
