import 'dotenv/config';
import axios from 'axios';


const keycloakUrl = process.env.KEYCLOAK_URL!;
const keycloakRealm = process.env.KEYCLOAK_REALM!;
const keycloakClient = process.env.KEYCLOAK_CLIENT!;
const userServiceUrl = process.env.USER_SERVICE_URL!;

const login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', keycloakClient);
    params.append('username', username);
    params.append('password', password);
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

    return response.data;
};

const register = async (email:string, password:string, firstName:string, lastName:string, onboardingToken:string) => {
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