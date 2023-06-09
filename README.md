# A Role Based Medical System REST API Nest.js with TypeScript and ESLint

A REST API. Using Nestjs, TypeScript, MongoDB, MongoDB Atlas Database, Docker, ESlint, JWT, Passport Authentication.

## Get started

```sh
# Install dependencies
$ npm i

# if npm i fails, try
$ npm i --legacy-peer-deps

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Setting .env environment

```sh
# Create an .env file in the root directory of the application
# Set MongoDB URI
$ MONGO_URI=mongodb://[username:password@]host[:port][,...hostN[:port]][/[database][?parameter_list]]

# Set the JWT secret key
$ JWT_ACCESS_SECRET=secret

# Set the JWT Refresh secret key
$ JWT_REFRESH_SECRET

# Especify the port
$ PORT=port
```

## Docker Setup

```sh
# Give your docker image a name
$ docker build -t <your username>/medical-api .

# for example
$ docker build -t medical-api .

# After your Docker image is successfully build start it with this command
$ docker run -p 3000:3000 --env-file .env -d <your username>/nest-api

# With Docker compose
$ docker-compose up

# As a background service
$ docker-compose up -d
```

## API documentation

```sh
# You can find the Postman API documentation here
$ resources/API/nest-medical.postman_collection.json

# Swagger
$ http://<host>:<port>/api
```

## Features

- ESLint and Prettier are integrated with VSCode to fix and format code on save (you need eslint and prettier VSCode plugins)
- TypeScript
- MongoDB Altas connection
- JWT authentication
- Role Based System
- Passport Authentication
- PDF endpoint report generated with MongoDB data
- Dockerfile and docker-compose to generate an optimized production container
- Deployment configuration to deploy to Heroku
- API documentation

## License

MIT

---

> [SebastianCrow](https://github.com/sebastian-crow)
