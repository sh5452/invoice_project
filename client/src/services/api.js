import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000"
});
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    console.log("TOKEN BEFORE REQUEST:", token);

    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log("AUTH HEADER:", config.headers.Authorization);

    return config;
});

api.interceptors.response.use(
    (response) => response,

    (error) => {

        if (
            error.response &&
            (error.response.status === 401 
            )
        ) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/";
        }

        return Promise.reject(error);
    }
);

export default api;