// src/services/api.ts
import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://SEU_IP_LOCAL:8000/api',
});
