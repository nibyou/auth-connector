"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const axios_1 = require("axios");
const keycloakUrl = process.env.KEYCLOAK_URL;
const keycloakRealm = process.env.KEYCLOAK_REALM;
const keycloakClient = process.env.KEYCLOAK_CLIENT;
const userServiceUrl = process.env.USER_SERVICE_URL;
const login = async (username, password) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', keycloakClient);
    params.append('username', username);
    params.append('password', password);
    const response = await axios_1.default.post(`${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    axios_1.default.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
    return response.data;
};
const register = async (email, password, firstName, lastName, onboardingToken) => {
    const data = {
        email,
        password,
        firstName,
        lastName,
        onboardingToken,
    };
    const response = await axios_1.default.post(`${userServiceUrl}/users/register`, data, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};
//# sourceMappingURL=auth-connector.js.map