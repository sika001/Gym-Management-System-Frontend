import axios from "axios";
require("dotenv").config(); //čita .env fajl

const api_url = process.env.API_URL;
const jwtInterceptor = axios.create({});

jwtInterceptor.interceptors.response.use(
    (response) => {
        //if a request is authorized, it will return a response
        console.log("AUTORIZOVAN ZAHTEV");
        return response;
    },
    async (error) => {
        console.log("NEAUTORIZOVAN ZAHTEV");
        if (error.response.status === 401) {
            //PROVJERITI ULAZI LI SE IKAD ODJE, JER NE ZNAM BACA LI SE GRESKA 401 NA MOM BACK-u
            console.log("401-UNAUTHORIZED");

            //if a request is unauthorized, it will try to refresh the token
            await axios
                .get(`${api_url}/refresh-token`, {
                    withCredentials: true,
                })
                .catch((err) => {
                    //someone is trying to access /refresh-token so reject it and remove the user from the local storage
                    // localStorage.removeItem("userProfile");
                    return Promise.reject(err);
                });
            console.log("Retrying the failed request", error.config);
            return axios(error.config); //it will retry the failed request
        } else {
            return Promise.reject(error);
        }
    }
);

export default jwtInterceptor;
