# Kasir API

Welcome to the Kasir API project! This project is the project I worked on during my internship.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Flows](#flows)
- [Documentation](#documentation)

## Introduction

Kasir API is API for managing sales, and inventory data in a POS system.

## Features

- User authentication and authorization
- Product management
- Sales transactions

## Installation

To install and run the Kasir API locally, follow these steps:

1. Clone the repository:

```sh
git clone https://github.com/agungramananda/Point-of-Sales-Hapi.js.git
```

2. Navigate to the project directory:

```sh
cd Kasir_API
```

3. Install dependencies:

```sh
npm install
```

4. Set up environment variables:

```sh
cp .env.example .env
```

Ensure the PostgreSQL and Redis services are running, and adjust the environment variables accordingly.

For `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`, set their values.

5. Start the server:

```sh
npm start
```

## Usage

After starting the server, you can access the API at `http://localhost:3000`. Use tools like Postman or cURL to interact with the endpoints.

## Flows

Here are the flow of the API : https://www.figma.com/board/5prAeIQdNRJGFEl0UwZF3F/Api-Flow?node-id=0-1&node-type=canvas&t=WWuPoswuOZmvxG4l-0

## Documentation

Here are the documentation of the API : https://documenter.getpostman.com/view/31686580/2sAXxMesyK

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.
