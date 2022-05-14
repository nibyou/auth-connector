import axios from 'axios';


const keycloakUrl = process.env.KEYCLOAK_URL!;
const keycloakRealm = process.env.KEYCLOAK_REALM!;
const keycloakClient = process.env.KEYCLOAK_CLIENT!;
const userServiceUrl = process.env.USER_SERVICE_URL!;
const loginUrl = process.env.LOGIN_URL!;

export const login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', keycloakClient);
    params.append('username', username);
    params.append('password', password);
    let response;
    try {
      response = await axios.post(
        `${keycloakUrl}/realms/${keycloakRealm}/protocol/openid-connect/token`,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
    } catch (e) {
      return Promise.reject("Login failed");
    }
    
    if (!response.data.access_token) {
      return Promise.reject("Login failed");
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;

    if (localStorage.getItem('refreshToken')) {
      localStorage.removeItem('refreshToken');
    }

    localStorage.setItem('refreshToken', response.data.refresh_token);

    return setupRefreshInterval(response.data.expires_in - 30) // refresh 30 seconds before access token expires
};

export const register = async (email:string, password:string, firstName:string, lastName:string, onboardingToken:string) => {
  const data = {
    email,
    password,
    firstName,
    lastName,
    onboardingToken,
  }
  const response = await axios.post(
    `${userServiceUrl}/users/register`,
    data,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

const refreshAccessWithRefreshToken = async () => {
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

  axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;

  if (localStorage.getItem('refreshToken')) {
    localStorage.removeItem('refreshToken');
  }

  localStorage.setItem('refreshToken', response.data.refresh_token);
}

function setupRefreshInterval(seconds: number) {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      setInterval(() => {
        refreshAccessWithRefreshToken();
      }, seconds * 1000);
    } catch (e) {
      return Promise.reject("Login failed " + e);
    }

    return Promise.resolve();
  }
  else {
    return Promise.reject("No refresh token found, needs to login again");
  }
}