import { expect } from "chai";
import { network } from "hardhat";

async function getEthers() {
  const { ethers } = await network.connect();
  return ethers;
}

async function deployFresh() {
  const ethers = await getEthers();
  const [acc0, acc1, acc2, acc3] = await ethers.getSigners();

  const Factory = await ethers.getContractFactory("ResourceSwap");
  const c = await Factory.deploy();
  await c.waitForDeployment();

  return { ethers, c, acc0, acc1, acc2, acc3 };
}

function errMsg(e: any): string {
  return e?.shortMessage ?? e?.reason ?? e?.message ?? "Unknown error";
}

async function warp(ethers: any, secs: number) {
  await ethers.provider.send("evm_increaseTime", [secs]);
  await ethers.provider.send("evm_mine", []);
}

async function jumpAfterLock(c: any, ethers: any) {
  const lock = Number(await c.LOCK_DURATION());
  await warp(ethers, lock + 20);
}

async function jumpAfterCooldown(c: any, ethers: any) {
  const cd = Number(await c.COOLDOWN());
  await warp(ethers, cd + 5);
}

async function jumpAfterAction(c: any, ethers: any) {
  await jumpAfterLock(c, ethers);
  await jumpAfterCooldown(c, ethers);
}

async function expectFail(p: Promise<any>, contains?: string) {
  try {
    const tx = await p;
    if (tx?.wait) await tx.wait();
    throw new Error("Expected tx to fail but it succeeded");
  } catch (e: any) {
    const m = errMsg(e);
    if (contains) {
      expect(m.toLowerCase()).to.include(contains.toLowerCase());
    }
  }
}

async function mintAs(c: any, signer: any, name: string, tier: number, value: number, uri: string) {
  await (await c.connect(signer).mintResource(name, "animal", tier, value, uri)).wait();
}

async function approveToken(c: any, signer: any, tokenId: number) {
  await (await c.connect(signer).approve(await c.getAddress(), tokenId)).wait();
}

async function createOffer(c: any, signer: any, offeredId: number, requestedId: number) {
  await (await c.connect(signer).createOffer(offeredId, requestedId)).wait();
  const offerId = Number(await c.nextOfferId()) - 1;
  return offerId;
}

describe("ResourceSwap - Offers / Accept / Cancel", function () {
  it("1) createOffer succeeds after lock and creates an active offer with correct fields", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");

    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    const offerId = await createOffer(c, acc0, 1, 2);

    const o = await c.offers(offerId);
    expect(o.active).to.equal(true);
    expect(Number(o.offeredTokenId)).to.equal(1);
    expect(Number(o.requestedTokenId)).to.equal(2);
    expect(o.offerer.toLowerCase()).to.equal((await acc0.getAddress()).toLowerCase());
  });

  it("2) createOffer fails if offered token does not exist", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");

    await jumpAfterAction(c, ethers);

    await expectFail(c.connect(acc0).createOffer(999, 2));
  });

  it("3) createOffer fails if requested token does not exist", async () => {
    const { ethers, c, acc0 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    await expectFail(c.connect(acc0).createOffer(1, 999));
  });

  it("4) createOffer fails if caller is not owner of offered token", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");

    await jumpAfterAction(c, ethers);

    await expectFail(c.connect(acc1).createOffer(1, 2));
  });

  it("5) createOffer fails if offered token is not approved", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");

    await jumpAfterAction(c, ethers);

    await expectFail(c.connect(acc0).createOffer(1, 2));
  });

  it("6) acceptOffer fails if offer is inactive", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");
    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    const offerId = await createOffer(c, acc0, 1, 2);

    await (await c.connect(acc0).cancelOffer(offerId)).wait();

    await expectFail(c.connect(acc1).acceptOffer(offerId));
  });

  it("7) acceptOffer fails if acceptor is not owner of requested token", async () => {
    const { ethers, c, acc0, acc1, acc2 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");
    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    const offerId = await createOffer(c, acc0, 1, 2);

    await expectFail(c.connect(acc2).acceptOffer(offerId));
  });

  it("8) acceptOffer fails if requested token is not approved by acceptor", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");
    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    const offerId = await createOffer(c, acc0, 1, 2);

    await expectFail(c.connect(acc1).acceptOffer(offerId));
  });

  it("9) acceptOffer succeeds when both sides approved and swaps owners; offer becomes inactive", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");
    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    await approveToken(c, acc1, 2);

    const offerId = await createOffer(c, acc0, 1, 2);

    await (await c.connect(acc1).acceptOffer(offerId)).wait();

    expect((await c.ownerOf(1)).toLowerCase()).to.equal((await acc1.getAddress()).toLowerCase());
    expect((await c.ownerOf(2)).toLowerCase()).to.equal((await acc0.getAddress()).toLowerCase());

    const o = await c.offers(offerId);
    expect(o.active).to.equal(false);
  });

  it("10) cancelOffer can only be called by the offerer", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");
    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    const offerId = await createOffer(c, acc0, 1, 2);

    await expectFail(c.connect(acc1).cancelOffer(offerId));

    await (await c.connect(acc0).cancelOffer(offerId)).wait();

    const o = await c.offers(offerId);
    expect(o.active).to.equal(false);
  });

  it("11) cooldown: createOffer then immediate createOffer fails", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");
    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    await createOffer(c, acc0, 1, 2);

    await expectFail(c.connect(acc0).createOffer(1, 2), "cooldown");
  });

  it("12) lock: after acceptOffer, the user is locked and immediate action fails", async () => {
    const { ethers, c, acc0, acc1 } = await deployFresh();

    await mintAs(c, acc0, "Lapin", 2, 700, "ipfs://Lapin.json");
    await mintAs(c, acc1, "Singe", 1, 900, "ipfs://Singe.json");
    await jumpAfterAction(c, ethers);

    await approveToken(c, acc0, 1);
    await approveToken(c, acc1, 2);

    const offerId = await createOffer(c, acc0, 1, 2);

    await (await c.connect(acc1).acceptOffer(offerId)).wait();

    await expectFail(c.connect(acc1).createOffer(1, 2), "locked");
  });
});