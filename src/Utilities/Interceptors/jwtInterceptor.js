import axios from "axios";
import environment from "../../environment";

const api_url = environment.api_url;
const jwtInterceptor = axios.create({});

//https://www.youtube.com/watch?v=X52wOj38V6E&list=WL&index=1&ab_channel=NaveenBommidiTechSeeker
jwtInterceptor.interceptors.response.use(
    (response) => {
        console.log("AUTORIZOVAN ZAHTEV");
        return response;
    },
    async (error) => {
        console.log("NEAUTORIZOVAN ZAHTEV");
        if (error.response.status === 401) {
            await axios
                .get(`${api_url}/refresh-token`, {
                    withCredentials: true,
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
            console.log(error.config);

            return axios(error.config); //POGLEDATI OPET OVO, OVO VALJDA TREBA OPET POSLATI ZAHTEV
        } else {
            return Promise.reject(error);
        }
    }
);

export default jwtInterceptor;
