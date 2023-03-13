# A Role Based Medical System REST API Next.js with TypeScript and ESLint

A REST API. Using Nextjs, TypeScript, MongoDB, MongoDB Atlas Database, Docker, ESlint, JWT, Passport Authentication.

## Get started

```sh
# Install dependencies
$ npm i

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

## Features

- ESLint and Prettier are integrated with VSCode to fix and format code on save (you need eslint and prettier VSCode plugins)
- TypeScript
- MongoDB Altas connection
- JWT authentication
- Role Based System
- Passport Authentication

## License

MIT

---

> [SebastianCrow](https://github.com/sebastian-crow)
