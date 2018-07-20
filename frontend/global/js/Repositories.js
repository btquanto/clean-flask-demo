import axios from 'axios';
import FormData from 'form-data'

export default {
    authentication: {
        getStatus: () => axios.get('/api/auth/status'),
        login: (identity, password) => {
            let form = new FormData();
            form.append("email", identity);
            form.append("password", password);
            return axios.post('/api/auth/login', form);
        },
        logout: () => ({}),
    }
};