import 'dotenv/config';
export declare const login: (username: string, password: string) => Promise<any>;
export declare const register: (email: string, password: string, firstName: string, lastName: string, onboardingToken: string) => Promise<any>;
