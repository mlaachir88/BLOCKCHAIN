# ResourceSwap

## Présentation du projet

ResourceSwap est une application décentralisée Web3 permettant aux utilisateurs de créer, posséder et échanger des ressources numériques tokenisées sous forme de NFT.

Le projet simule un système d’échange inspiré de mécaniques de collection ou de type Monopoly, tout en appliquant des règles métiers strictes directement sur la blockchain afin de garantir sécurité, équité et réalisme.

---

## Définition du cas d’usage

L’objectif de ResourceSwap est de démontrer comment la blockchain peut être utilisée pour gérer la propriété et l’échange d’actifs numériques sans intermédiaire centralisé.

Chaque ressource est représentée par un NFT unique pouvant être échangé entre utilisateurs via un système d’offres contrôlé.

L’ensemble des règles métiers est implémenté on-chain et ne peut pas être contourné par le frontend.

---

## Scénario type

1. L’utilisateur connecte son portefeuille via MetaMask.  
2. Il mint une ressource NFT avec des métadonnées prédéfinies.  
3. Il crée une offre d’échange entre deux NFTs.  
4. Un autre utilisateur accepte l’offre si toutes les conditions sont respectées.  
5. Le smart contract échange les propriétaires et met à jour l’état.

---

## Pourquoi la blockchain

La blockchain est pertinente pour ce projet car elle permet :

- une propriété vérifiable et immuable des ressources  
- des échanges trustless garantis par smart contract  
- un historique de transactions transparent  
- l’application stricte des règles métiers  
- un stockage décentralisé des métadonnées via IPFS  

---

## Architecture du projet

Le projet est organisé sous forme de monorepo avec une séparation claire des responsabilités.

### Structure du dépôt

