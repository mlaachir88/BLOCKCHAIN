import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const secs = parseInt(process.env.SECS ?? "620", 10);

  await ethers.provider.send("evm_increaseTime", [secs]);
  await ethers.provider.send("evm_mine", []);

  const b = await ethers.provider.getBlock("latest");
  console.log("Time advanced by", secs, "seconds. Now:", b?.timestamp);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});