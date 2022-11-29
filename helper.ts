import env from 'react-dotenv';
import axios from 'axios';

export const axiosInstance = axios.create({});

export async function refreshAccessWithRefreshToken() {
  const keycloakUrl = env.KEYCLOAK_URL!;
  const keycloakRealm = env.KEYCLOAK_REALM!;
  const keycloakClient = env.KEYCLOAK_CLIENT!;
  const refresh_token = localStorage.getItem('refreshToken');
  if (!refresh_token) {
    return Promise.reject("No refresh token found, needs to login again");
  }
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', keycloakClient);
  params.append('refresh_token', refresh_token);
  const response = await axios.post(
    `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;

  if (localStorage.getItem('refreshToken')) {
    localStorage.removeItem('refreshToken');
  }

  localStorage.setItem('refreshToken', response.data.refresh_token);
  return response.data;
}

export function parseJwt (token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

axiosInstance.interceptors.request.use(async function(config) {
    const currentAccessToken = axiosInstance.defaults.headers.common["Authorization"]; // Bearer: <token>
    if (currentAccessToken) {
      let parsedToken = parseJwt((""+currentAccessToken).split(" ")[1]);
      // if token expires in more than one minute, return
      if (parsedToken.exp - Math.floor(Date.now() / 1000) > 60) {
        return config;
      } else {
        await refreshAccessWithRefreshToken();
        return config;
      }
    } else {
      let kcRes = await refreshAccessWithRefreshToken();
      config.headers!.authorization = "Bearer " + kcRes.access_token;
      return config;
    }
  });