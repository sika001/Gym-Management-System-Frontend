import axios from "axios";

const api_url = process.env.REACT_APP_API_URL;
const jwtInterceptor = axios.create({});

jwtInterceptor.interceptors.response.use((response) => {
        //ako je zahtjev autorizovan, vraća se response
        console.log("AUTORIZOVAN ZAHTEV");
        return response;
    },
    async (error) => {
        console.log("NEAUTORIZOVAN ZAHTEV");
        if (error.response.status === 401) {

            console.log("401-UNAUTHORIZED");
            //Ako je zahtjev neautorizovan, pokušava da se obnovi token
            await axios
                .get(`${api_url}/refresh-token`, {
                    withCredentials: true,
                })
                .catch((err) => {
                   
                    return Promise.reject(err);
                });
            console.log("Retrying the failed request", error.config);

            return axios(error.config); // ako je token obnovljen, ovaj dio koda ponovalja prethodni zahtjev
        } else {
            return Promise.reject(error);
        }
    }
);

export default jwtInterceptor;
