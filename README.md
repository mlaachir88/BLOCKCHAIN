# ResourceSwap

## Overview

ResourceSwap is a Web3 decentralized application that enables users to mint, own, and exchange digital resources represented as NFTs.  
The project focuses on implementing a controlled NFT trading system where all business rules are enforced directly on-chain through a smart contract.

The application combines a Solidity smart contract deployed on a local Ethereum network with a React frontend that interacts with the blockchain via MetaMask.

---

## Project Goals

The main objectives of ResourceSwap are:
- Demonstrate the use of blockchain to manage ownership of digital assets
- Implement trustless exchanges between users without intermediaries
- Enforce non-bypassable business rules directly in the smart contract
- Use decentralized storage for NFT metadata
- Validate the system through extensive unit testing

---

## Use Case

Each digital resource is represented as a unique NFT that can be exchanged between users through a marketplace based on offers.

A typical usage flow is:
1. A user connects their wallet using MetaMask
2. The user mints a resource NFT with predefined metadata
3. The user creates an exchange offer proposing a swap between two NFTs
4. Another user accepts the offer if all conditions are satisfied
5. The smart contract swaps ownership of the NFTs and updates the state

All operations are validated on-chain, ensuring correctness and security.

---

## Why Blockchain

Blockchain technology is relevant for this project because it provides:
- Verifiable and immutable ownership of resources
- Trustless exchanges enforced by smart contracts
- Transparent and auditable transaction history
- Strict enforcement of business rules
- Decentralized storage of metadata via IPFS

---

## Architecture

The project is organized as a monorepo with a clear separation between frontend and blockchain logic.

Repository structure:

BLOCKCHAIN/
- frontend/        React application (DApp interface)
- resourceswap/    Smart contracts, scripts, and tests
- docs/            Documentation and report assets

---

## Technical Stack

Blockchain and Smart Contracts:
- Ethereum (Hardhat local network)
- Solidity
- OpenZeppelin ERC721URIStorage
- ReentrancyGuard

Development and Testing:
- Hardhat
- Mocha and Chai
- TypeScript

Frontend:
- React
- TypeScript
- Vite
- ethers.js v6
- MetaMask

Decentralized Storage:
- IPFS

---

## Smart Contract Design

The main contract, ResourceSwap.sol, implements an ERC721 NFT with extended business logic.

Each NFT includes:
- name
- type
- tier (level from 1 to 4)
- value
- IPFS URI
- previous owners
- creation timestamp
- last transfer timestamp

Business rules enforced on-chain:
- Maximum of 4 NFTs owned per user
- Cooldown period between consecutive actions
- Temporary lock after critical actions such as accepting an offer
- Ownership and approval checks for all exchanges

---

## Marketplace and Exchange System

The exchange system is based on offers:
- A user creates an offer proposing to exchange one NFT for another
- Another user can accept the offer if they own and approved the requested NFT
- The smart contract swaps ownership and deactivates the offer
- The offer creator can cancel an active offer

This design prevents unauthorized transfers and ensures fairness.

---

## IPFS Integration

NFT metadata is stored as JSON files on IPFS.  
Each NFT tokenURI points to an ipfs:// address.

The frontend converts IPFS URIs to HTTP gateways to display images and metadata while keeping the data decentralized.

---

## Frontend Application

The frontend allows users to:
- Connect their wallet via MetaMask
- View owned NFTs
- Mint new NFTs
- Approve NFTs for exchange
- Create, accept, and cancel offers
- Browse marketplace offers
- View transaction status (pending, success, error)

All validations are performed by the smart contract.

---

## Testing and Validation

Unit tests are implemented using Hardhat with Mocha and Chai.

Covered features include:
- NFT minting
- Ownership limits
- Cooldown and lock rules
- Offer creation, acceptance, and cancellation
- Approval and ownership validation
- Timestamp consistency

Test results:
- 19 unit tests passing
- Line coverage approximately 98.75 percent
- Statement coverage approximately 96.05 percent

These results demonstrate the robustness and reliability of the smart contract.

---

## Running the Project

Smart contract setup:
cd resourceswap  
npm install  
npx hardhat test  
npx hardhat test --coverage  
npx hardhat node  
npx hardhat run scripts/deploy.ts --network localhost  

Frontend setup:
cd frontend  
npm install  
npm run dev  

MetaMask must be connected to the Hardhat local network (chain ID 31337).

---

## Conclusion

ResourceSwap fulfills the project requirements by combining a secure smart contract, strict on-chain business rules, decentralized metadata storage, and a functional frontend interface.  
The project demonstrates a solid understanding of blockchain development, smart contract design, testing practices, and Web3 application architecture.

Potential future improvements include offer pagination, data indexing using The Graph, and deployment to a public testnet.
