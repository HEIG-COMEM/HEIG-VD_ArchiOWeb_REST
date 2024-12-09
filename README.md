# REST API

This project is a REST API built with Express.js, providing endpoints for user authentication, publication management, comment management, friend management, and admin functionalities.
It is a simplified version of BeReal, a social media platform for sharing real-life experiences.

## Table of Contents

-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Running the Application](#running-the-application)
-   [Seeding the Database](#seeding-the-database)
-   [Running Tests](#running-tests)
-   [API Documentation](#api-documentation)

## Installation

1. Clone the repository:

```sh
git clone https://github.com/your-repo/rest-api.git
cd rest-api
```

2. Install the dependencies:

```sh
npm install
```

## Configuration

Create a `.env` file in the root directory and provide the environment variables shown in the `.env.example` file.

### Cloud services

This project uses the following cloud services:

-   [Cloudinary](https://cloudinary.com/) for storing images.
-   [OneSignal](https://onesignal.com/) for sending push notifications.

therefore, you need to create accounts on these platforms and provide the necessary credentials in the `.env` file.

## Running the Application

To start the application in development mode, run:

```sh
npm run dev
```

To start the application in production mode, run:

```sh
npm start
```

## Seeding the Database

To facilitate the development and testing process, you can seed the database with initial data.

### Prerequisite

-   Ensure you have MongoDB running.

### Running the Seeders

To seed the database, run the following command:

```sh
npm run seed
```

## Running Tests

To run the tests, use the following command:

```sh
npm test
```

## API Documentation

The API documentation is available at `/docs` endpoint when the application is running.
