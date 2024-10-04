# Kasir API

Welcome to the Kasir API project! This API is designed to manage point of sale (POS) systems efficiently.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Endpoints](#endpoints)
- [Contributing](#contributing)
- [License](#license)

## Introduction

Kasir API is a robust and scalable API for managing sales, inventory, and customer data in a POS system.

## Features

- User authentication and authorization
- Product management
- Sales transactions
- Inventory tracking
- Customer management

## Installation

To install and run the Kasir API locally, follow these steps:

1. Clone the repository:

```sh
git clone https://github.com/yourusername/Kasir_API.git
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

Here are the flow of the api:

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
