import { network } from "hardhat";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const { ethers } = await network.connect();

  const file = path.join(process.cwd(), "deployments", "localhost.json");
  if (!fs.existsSync(file)) {
    throw new Error("deployments/localhost.json introuvable. Lance d'abord deploy.ts");
  }

  const { address: CONTRACT } = JSON.parse(fs.readFileSync(file, "utf-8"));

  const tokenId = BigInt(process.env.TOKEN ?? "1");
  const c = await ethers.getContractAt("ResourceSwap", CONTRACT);

  let owner: string;
  try {
    owner = await c.ownerOf(tokenId);
  } catch {
    console.log("Token inexistant:", tokenId.toString());
    return;
  }

  const uri = await c.tokenURI(tokenId);
  const meta = await c.resources(tokenId);

  console.log("Contract:", CONTRACT);
  console.log("Token:", tokenId.toString());
  console.log("Owner:", owner);
  console.log("URI:", uri);

  console.log("Meta.name:", meta.name);
  console.log("Meta.rtype:", meta.rtype);
  console.log("Meta.tier:", meta.tier.toString());
  console.log("Meta.value:", meta.value.toString());
  console.log("Meta.ipfsUri:", meta.ipfsUri);
  console.log("Meta.createdAt:", meta.createdAt.toString());
  console.log("Meta.lastTransferAt:", meta.lastTransferAt.toString());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});