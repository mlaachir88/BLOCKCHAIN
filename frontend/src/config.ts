export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const HARDHAT_CHAIN_ID = 31337;

export const CID_IMAGES = "bafybeig4n3u64ndpibgrzg4jkyyhmieclyf4drzltw5git4nixlymkrry4";

export const CID_META = "bafybeidxmkohxp4mdrcg7iv6z37fxxp75zl5fg6zuqgutv6jjmozd2lztq";

export function ipfsToHttp(ipfsUri: string) {
  if (!ipfsUri) return "";
  if (ipfsUri.startsWith("ipfs://")) {
    const cidPath = ipfsUri.replace("ipfs://", "");
    return `https://ipfs.io/ipfs/${cidPath}`;
  }
  return ipfsUri;
}

export const ANIMALS: Record<string, string> = {
  Lapin: `ipfs://${CID_META}/Lapin.json`,
  Hibou: `ipfs://${CID_META}/Hibou.json`,
  Singe: `ipfs://${CID_META}/Singe.json`,
  Cerf: `ipfs://${CID_META}/Cerf.json`,
  Mouton: `ipfs://${CID_META}/Mouton.json`,
  Perroquet: `ipfs://${CID_META}/Perroquet.json`,
  Suricate: `ipfs://${CID_META}/Suricate.json`,
  Crocodile: `ipfs://${CID_META}/Crocodile.json`,
};