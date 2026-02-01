import { expect } from "chai";
import { network } from "hardhat";

async function warp(ethers: any, secs: number) {
  await ethers.provider.send("evm_increaseTime", [secs]);
  await ethers.provider.send("evm_mine", []);
}

async function jumpAfterAction(ethers: any) {
  await warp(ethers, 620);
}

async function deploy() {
  const { ethers } = await network.connect();

  const [acc0, acc1, acc2] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("ResourceSwap");
  const c = await Factory.deploy();
  await c.waitForDeployment();

  return { c, acc0, acc1, acc2, ethers };
}

describe("ResourceSwap - Mint, Time rules and Limits", function () {
  it("mintResource: mint succeeds with correct tokenURI and metadata", async () => {
    const { c, acc0 } = await deploy();

    const tx = await c
      .connect(acc0)
      .mintResource("Lapin", "animal", 2, 700, "ipfs://Lapin.json");
    await tx.wait();

    expect(await c.ownerOf(1)).to.equal(await acc0.getAddress());
    expect(await c.tokenURI(1)).to.equal("ipfs://Lapin.json");

    const meta = await c.resources(1);
    expect(meta.name).to.equal("Lapin");
    expect(meta.rtype).to.equal("animal");
    expect(meta.tier).to.equal(2);
    expect(meta.value).to.equal(700);
    expect(meta.ipfsUri).to.equal("ipfs://Lapin.json");
    expect(Number(meta.createdAt)).to.be.greaterThan(0);
    expect(Number(meta.lastTransferAt)).to.be.greaterThan(0);
  });

  it("Cooldown: createOffer twice without delay reverts with cooldown error", async () => {
    const { c, acc0, acc1, ethers } = await deploy();

    await (await c.connect(acc0).mintResource("Lapin", "animal", 2, 700, "ipfs://Lapin.json")).wait();
    await (await c.connect(acc1).mintResource("Singe", "animal", 1, 900, "ipfs://Singe.json")).wait();

    await jumpAfterAction(ethers);

    await (await c.connect(acc0).approve(await c.getAddress(), 1)).wait();

    await (await c.connect(acc0).createOffer(1, 2)).wait();

    await expect(
      c.connect(acc0).createOffer(1, 2)
    ).to.be.revertedWith("Cooldown not finished");
  });

  it("Lock: createOffer immediately after mint reverts with lock error", async () => {
    const { c, acc0 } = await deploy();

    await (await c.connect(acc0).mintResource("Lapin", "animal", 2, 700, "ipfs://Lapin.json")).wait();

    await expect(
      c.connect(acc0).createOffer(1, 999)
    ).to.be.revertedWith("User locked");
  });

  it("After lock duration, mint becomes possible again", async () => {
    const { c, acc0, ethers } = await deploy();

    await (await c.connect(acc0).mintResource("Lapin", "animal", 2, 700, "ipfs://Lapin.json")).wait();

    await jumpAfterAction(ethers);

    const tx = await c
      .connect(acc0)
      .mintResource("Mouton", "animal", 2, 500, "ipfs://Mouton.json");
    await tx.wait();

    expect(await c.ownerOf(2)).to.equal(await acc0.getAddress());
  });

  it("MAX_OWNED: allows 4 mints and reverts on the 5th", async () => {
    const { c, acc0, ethers } = await deploy();

    await (await c.connect(acc0).mintResource("A", "animal", 1, 1, "ipfs://A.json")).wait();
    await jumpAfterAction(ethers);

    await (await c.connect(acc0).mintResource("B", "animal", 1, 1, "ipfs://B.json")).wait();
    await jumpAfterAction(ethers);

    await (await c.connect(acc0).mintResource("C", "animal", 1, 1, "ipfs://C.json")).wait();
    await jumpAfterAction(ethers);

    await (await c.connect(acc0).mintResource("D", "animal", 1, 1, "ipfs://D.json")).wait();
    await jumpAfterAction(ethers);

    await expect(
      c.connect(acc0).mintResource("E", "animal", 1, 1, "ipfs://E.json")
    ).to.be.revertedWith("Max owned reached");
  });

  it("tokensOfOwner returns all owned token IDs", async () => {
    const { c, acc0, ethers } = await deploy();

    await (await c.connect(acc0).mintResource("A", "animal", 1, 1, "ipfs://A.json")).wait();
    await jumpAfterAction(ethers);

    await (await c.connect(acc0).mintResource("B", "animal", 1, 1, "ipfs://B.json")).wait();
    await jumpAfterAction(ethers);

    await (await c.connect(acc0).mintResource("C", "animal", 1, 1, "ipfs://C.json")).wait();
    await jumpAfterAction(ethers);

    const ids = await c.tokensOfOwner(await acc0.getAddress());
    const asNums = ids.map((x: bigint) => Number(x)).sort((a, b) => a - b);

    expect(asNums).to.deep.equal([1, 2, 3]);
  });

  it("Metadata timestamps: createdAt is less than or equal to lastTransferAt on mint", async () => {
    const { c, acc0 } = await deploy();

    await (await c.connect(acc0).mintResource("Lapin", "animal", 2, 700, "ipfs://Lapin.json")).wait();
    const meta = await c.resources(1);

    expect(Number(meta.createdAt)).to.be.lessThanOrEqual(Number(meta.lastTransferAt));
  });
});