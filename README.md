# Stellar MedRec

## Project Structure

- **src/**: Contains the source code for the application.
  - **app.ts**: Entry point of the application. Initializes the Express app and sets up middleware and routes.
  - **blockchain/**: Contains logic for interacting with the Stellar blockchain.
    - **stellar.ts**: Functions for creating transactions, querying the blockchain, and handling Stellar-specific operations.
  - **controllers/**: Contains the business logic for handling medical records.
    - **medrecController.ts**: Class that manages creating, retrieving, and updating medical records.
  - **models/**: Defines the data structures used in the application.
    - **record.ts**: Represents a medical record with properties and methods for validation and formatting.
  - **routes/**: Defines the API routes for the application.
    - **medrecRoutes.ts**: Sets up routes for the MedRec functionality.
  - **types/**: Contains TypeScript interfaces for type definitions.
    - **index.ts**: Exports interfaces for medical records and blockchain transactions.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd consensus/stellar-medrec
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the application, run:
```
npm start
```

The application will be available at `http://localhost:3000`.

## Features

- Create, retrieve, and update medical records on the Stellar blockchain.
- Secure and decentralized storage of medical records.
- Easy integration with other applications using the provided API.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
