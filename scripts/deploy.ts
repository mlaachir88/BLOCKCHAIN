import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const Factory = await ethers.getContractFactory("ResourceSwap", deployer);
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  console.log("ResourceSwap deployed at:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});