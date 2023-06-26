import enviroment from "../enviroment";

const api_url = enviroment.api_url;

const getMembersData = async () => {
    const res = await fetch(`${api_url}/membership`); //url is good

    if (!res.ok) throw Error("Failed to fetch members data!");

    const data = await res.json();
    return data;
};

export default { getMembersData };
