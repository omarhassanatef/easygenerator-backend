# EasyGenerator Backend

NestJS backend task for easy generator using MongoDB, and JWT authentication.

## Tech Stack as required

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (httpOnly cookies)
- **Password Hashing**: bcrypt
- **API Documentation**: Swagger
- **Validation**: class-validator & class-transformer

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/easygenerator
JWT_SECRET=secret-jwt-key
JWT_EXPIRES_IN=7d
COOKIE_SECRET=secret-cookie-key
```

## Running the Application

### Development mode

```bash
npm run start:dev
```

### Production mode

```bash
npm run build
npm run start:prod
```

## API Documentation

Access the Swagger documentation at:

```
http://localhost:3000/api
```

