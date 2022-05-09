# @nibyou/auth-connector 

## Install

```bash 
yarn add @nibyou/auth-connector
```

or 

```bash
npm i --save @nibyou/auth-connector
```

## Usage

```ts
import { login, register } from '@nibyou/auth-connector';

...
const registerResponse = await register(email:"string", password:"string", firstName:"string", lastName:"string", onboardingToken:"string");

...


const loginRespose = await login(username: "string", password: "string");
```