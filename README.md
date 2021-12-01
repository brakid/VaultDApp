# Vault DApp
DApp to store and retrieve information. The owner of a vault alone is able to access the data.
Ownership of a vault is represented by holding an [ERC-721 (NFT)](https://ethereum.org/en/developers/docs/standards/tokens/erc-721/) token.

Project URL: https://brakid-vault.web.app

The Vault Token contract is deployed to the Polygon Testnetwork: https://mumbai.polygonscan.com/ under address: [0xd9fDD544c7db7a69D87755Cc702dEe49e44c4857](https://mumbai.polygonscan.com/token/0xd9fDD544c7db7a69D87755Cc702dEe49e44c4857)

Each vault stores data that the vault owner can access only. Access to the data is managed by the backend system: to verify the ownership each read and write request needs to be accompanied with a [signature](https://medium.com/mycrypto/the-magic-of-digital-signatures-on-ethereum-98fe184dc9c7) provided by the wallet owning the NFT for the vault to open. This ensures that the call to read or write data is done by the NFT owner only (assuming the NFT owner does not give away the signature). To avoid using a signature repeatedly by unauthorized perticipants, each signature contains atimestamp that limits the validity of a message to 5 minutes.

![Access granted](./images/access.png)

![Access denied](./images/noaccess.png)

## Technologies used:
* [React JS with Typescript](https://create-react-app.dev/docs/getting-started#creating-a-typescript-app) for the webapp
* [Tailwind CSS](https://tailwindcss.com/) for styling the webapp
* [Solidity](https://soliditylang.org/) & [Truffle](https://trufflesuite.com/) for the Smart Contracts
* [Golang](https://go.dev/) and [Gin Gonic](https://gin-gonic.com/) for the backend REST server managing the database access
* [Ethereum client for Golang](https://geth.ethereum.org/) to validate the ownership and check the signatures of the system accessing the vault data
* [Firebase](https://firebase.google.com/) for hosting the webapp and the database
* [https://heroku.com/](Heroku) for hosting the backend as a [Docker](https://www.docker.com/) image
* [Polygon (Matic)](https://polygon.technology/) Testnet as an EVM compatible blockchain to deploy and run the NFT Contract (ERC-721)
