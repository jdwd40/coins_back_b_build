
# Fantasy Crypto Exchange Simulator - API Documentation

## Overview
This document outlines the API endpoints for the Fantasy Crypto Exchange Simulator. The backend manages user accounts, coin data, portfolio management, transaction history, and coin price history.

## Endpoints

### User Management

#### Register User
- **Endpoint**: `/api/users/register`
- **Method**: `POST`
- **Description**: Register a new user.
- **Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

#### User Login
- **Endpoint**: `/api/users/login`
- **Method**: `POST`
- **Description**: Authenticate a user.
- **Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

#### Get User Profile
- **Endpoint**: `/api/users/:userId`
- **Method**: `GET`
- **Description**: Retrieve the profile of a user.

#### Update User Profile
- **Endpoint**: `/api/users/:userId`
- **Method**: `PUT`
- **Description**: Update user details.

#### Delete User
- **Endpoint**: `/api/users/:userId`
- **Method**: `DELETE`
- **Description**: Delete a user's account.

### Coin Data Management

#### List Coins
- **Endpoint**: `/api/coins`
- **Method**: `GET`
- **Description**: Get a list of all coins.

#### Get Coin Details
- **Endpoint**: `/api/coins/:coinId`
- **Method**: `GET`
- **Description**: Get detailed information about a specific coin.

#### Update Coin Details
- **Endpoint**: `/api/coins/:coinId`
- **Method**: `PUT`
- **Description**: Get detailed information about a specific coin.

### Portfolio Management

#### Get User Portfolio
- **Endpoint**: `/api/portfolio/:userId`
- **Method**: `GET`
- **Description**: Retrieve the portfolio of a user.

#### Update Portfolio (Buy/Sell)
- **Endpoint**: `/api/portfolio/:userId`
- **Method**: `PUT`
- **Description**: Update a user's portfolio.

### Transaction History

#### Get Transaction History
- **Endpoint**: `/api/transactions/:userId`
- **Method**: `GET`
- **Description**: Get the transaction history of a user.

### Coin Price History

#### Get Price History of a Coin
- **Endpoint**: `/api/coins/:coinId/price-history`
- **Method**: `GET`
- **Description**: Retrieve the price history of a specific coin.

#### Record New Price for a Coin
- **Endpoint**: `/api/coins/:coinId/price-history`
- **Method**: `POST`
- **Description**: Record a new price for a specific coin.
- **Body**:
  ```json
  {
    "price": "number",
    "timestamp": "string" // Optional, server can set this if not provided
  }
  ```

---

## Notes
- This API documentation will be updated with security features and additional endpoints as the application development progresses.
- All data returned by the API is in JSON format.
```

This documentation now includes endpoints for coin price history, allowing retrieval and recording of coin prices over time. The route names have been updated to use "coins" as you specified. This document will guide developers in understanding and integrating with your application's backend API.