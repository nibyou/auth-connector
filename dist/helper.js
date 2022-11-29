"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJwt = exports.refreshAccessWithRefreshToken = void 0;
const react_dotenv_1 = require("react-dotenv");
const axios_1 = require("axios");
const axiosInstance = axios_1.default.create({});
async function refreshAccessWithRefreshToken() {
    const keycloakUrl = react_dotenv_1.default.KEYCLOAK_URL;
    const keycloakRealm = react_dotenv_1.default.KEYCLOAK_REALM;
    const keycloakClient = react_dotenv_1.default.KEYCLOAK_CLIENT;
    const refresh_token = localStorage.getItem('refreshToken');
    if (!refresh_token) {
        return Promise.reject("No refresh token found, needs to login again");
    }
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', keycloakClient);
    params.append('refresh_token', refresh_token);
    const response = await axios_1.default.post(`${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`, params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
    if (localStorage.getItem('refreshToken')) {
        localStorage.removeItem('refreshToken');
    }
    localStorage.setItem('refreshToken', response.data.refresh_token);
    return response.data;
}
exports.refreshAccessWithRefreshToken = refreshAccessWithRefreshToken;
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}
exports.parseJwt = parseJwt;
axiosInstance.interceptors.request.use(async function (config) {
    const currentAccessToken = axiosInstance.defaults.headers.common["Authorization"];
    if (currentAccessToken) {
        let parsedToken = parseJwt(("" + currentAccessToken).split(" ")[1]);
        if (parsedToken.exp - Math.floor(Date.now() / 1000) > 60) {
            return config;
        }
        else {
            await refreshAccessWithRefreshToken();
            return config;
        }
    }
    else {
        let kcRes = await refreshAccessWithRefreshToken();
        config.headers.authorization = "Bearer " + kcRes.access_token;
        return config;
    }
});
//# sourceMappingURL=helper.js.map