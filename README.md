# ResourceSwap

## Présentation générale

ResourceSwap est une application décentralisée Web3 permettant aux utilisateurs de minter, posséder et échanger des ressources numériques représentées sous forme de NFT.  
Le projet met l’accent sur un système d’échange contrôlé, dans lequel l’ensemble des règles métiers est appliqué directement par le smart contract afin de garantir sécurité, cohérence et équité.

L’application repose sur un smart contract Solidity déployé sur un réseau Ethereum local et sur une interface frontend développée en React, connectée à la blockchain via MetaMask.

## Objectifs du projet

Les objectifs principaux de ResourceSwap sont les suivants :

- démontrer l’utilisation de la blockchain pour la gestion de la propriété d’actifs numériques
- permettre des échanges trustless entre utilisateurs sans intermédiaire
- implémenter des règles métiers non contournables directement on-chain
- utiliser un stockage décentralisé pour les métadonnées des NFTs
- valider le fonctionnement du système à l’aide de tests unitaires complets

## Cas d’usage

Chaque ressource numérique est représentée par un NFT unique pouvant être échangé entre utilisateurs via un système de marketplace basé sur des offres.

Un scénario d’utilisation typique est le suivant :

1. un utilisateur connecte son portefeuille via MetaMask
2. il mint une ressource NFT avec des métadonnées prédéfinies
3. il crée une offre d’échange proposant un swap entre deux NFTs
4. un autre utilisateur accepte l’offre si toutes les conditions sont respectées
5. le smart contract échange les propriétaires des NFTs et met à jour l’état

Toutes les opérations sont validées on-chain, garantissant la conformité aux règles métiers.

## Justification de l’utilisation de la blockchain

La blockchain est particulièrement adaptée à ce projet car elle permet :

- une propriété vérifiable et immuable des ressources
- des échanges trustless exécutés par smart contract
- un historique de transactions transparent et auditable
- l’application stricte des règles métiers sans dépendance au frontend
- un stockage décentralisé des métadonnées via IPFS

## Architecture du projet

Le projet est organisé sous forme de monorepo, avec une séparation claire entre la logique blockchain et l’interface utilisateur.

Structure du dépôt :

BLOCKCHAIN/
- frontend/ application React (DApp)
- resourceswap/ smart contracts, scripts et tests
- docs/ documentation et ressources du rapport

## Stack technique

Blockchain et smart contracts :

- Ethereum (réseau local Hardhat)
- Solidity
- OpenZeppelin ERC721URIStorage
- ReentrancyGuard

Développement et tests :

- Hardhat
- Mocha et Chai
- TypeScript

Frontend :

- React
- TypeScript
- Vite
- ethers.js v6
- MetaMask

Stockage décentralisé :

- IPFS

## Conception du smart contract

Le smart contract principal, ResourceSwap.sol, implémente un NFT ERC721 enrichi par des règles métiers spécifiques.

Chaque NFT contient les informations suivantes :

- name
- type
- tier (niveau de 1 à 4)
- value
- URI IPFS
- historique simplifié des propriétaires
- timestamp de création
- timestamp du dernier transfert

Règles métiers appliquées on-chain :

- un utilisateur ne peut posséder plus de 4 NFTs
- un délai minimum est imposé entre deux actions successives
- un verrou temporaire est appliqué après une action critique (ex. acceptation d’une offre)
- toutes les opérations vérifient la propriété et les approvals ERC721

## Système de marketplace et d’échange

Le système d’échange repose sur des offres :

- un utilisateur crée une offre proposant l’échange d’un NFT contre un autre
- un autre utilisateur peut accepter l’offre s’il possède et a approuvé le NFT demandé
- le smart contract échange les propriétaires et désactive l’offre
- le créateur de l’offre peut annuler celle-ci tant qu’elle n’a pas été acceptée

Ce mécanisme garantit des échanges sécurisés et contrôlés.

## Intégration IPFS

Les métadonnées des NFTs sont stockées sur IPFS sous forme de fichiers JSON.  
Le champ tokenURI de chaque NFT pointe vers une adresse ipfs://.

Le frontend convertit ces URI via une gateway HTTP afin d’afficher les images et les informations tout en conservant la décentralisation des données.

## Application frontend

L’interface utilisateur permet de :
- se connecter via MetaMask
- visualiser les NFTs possédés
- minter de nouveaux NFTs
- approuver des NFTs pour les échanges
- créer, accepter et annuler des offres
- consulter le marketplace
- visualiser l’état des transactions (pending, success, error)

L’ensemble des validations est réalisé par le smart contract.

## Tests unitaires et validation

Les tests unitaires sont implémentés avec Hardhat, Mocha et Chai.

Fonctionnalités couvertes :

- mint de NFTs
- limite de possession
- règles de cooldown et de verrou
- création, acceptation et annulation d’offres
- vérification des approvals et de la propriété
- cohérence des timestamps

Résultats :

- 19 tests unitaires passants
- couverture des lignes d’environ 98,75 pour cent
- couverture des instructions d’environ 96,05 pour cent

Ces résultats démontrent la robustesse et la fiabilité du smart contract.

## Exécution du projet

Smart contract :

cd resourceswap  
npm install  
npx hardhat test  
npx hardhat test --coverage  
npx hardhat node  
npx hardhat run scripts/deploy.ts --network localhost  

Frontend :

cd frontend  
npm install  
npm run dev  

MetaMask doit être connecté au réseau local Hardhat (chain ID 31337).

## Conclusion

ResourceSwap répond pleinement aux exigences du projet en combinant un smart contract sécurisé, des règles métiers strictes appliquées on-chain, un stockage décentralisé des métadonnées et une interface utilisateur fonctionnelle.  
Le projet démontre une bonne maîtrise du développement blockchain, de la conception de smart contracts, des tests unitaires et de l’architecture des applications Web3.  
Des améliorations futures pourraient inclure la pagination des offres, l’indexation des données via The Graph et un déploiement sur un testnet public.
