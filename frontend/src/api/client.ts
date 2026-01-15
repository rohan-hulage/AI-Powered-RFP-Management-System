import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Make sure this matches backend port
});

export default api;
