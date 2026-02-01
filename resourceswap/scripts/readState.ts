import { network } from "hardhat";

const CONTRACT = process.env.CONTRACT ?? "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const MAX_ACCOUNTS = parseInt(process.env.MAX_ACC ?? "20", 10);

function fmtSecs(s: number) {
  if (s <= 0) return "0s";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

async function main() {
  const { ethers } = await network.connect();
  const c = await ethers.getContractAt("ResourceSwap", CONTRACT);

  const nowBlock = await c.runner.provider.getBlock("latest");
  const now = Number(nowBlock.timestamp);

  console.log("Contract:", CONTRACT);
  console.log("name:", await c.name());
  console.log("symbol:", await c.symbol());
  console.log("MAX_OWNED:", Number(await c.MAX_OWNED()));
  console.log("COOLDOWN:", fmtSecs(Number(await c.COOLDOWN())));
  console.log("LOCK_DURATION:", fmtSecs(Number(await c.LOCK_DURATION())));
  console.log("NOW:", now);

  const signers = await ethers.getSigners();
  const count = Math.min(MAX_ACCOUNTS, signers.length);

  let printed = 0;

  for (let i = 0; i < count; i++) {
    const addr = await signers[i].getAddress();

    const tokenIds: bigint[] = await c.tokensOfOwner(addr);
    if (tokenIds.length === 0) continue;

    printed++;
    console.log(`\n=== Account#${i} (${addr}) ===`);

    const ownedCount = Number(await c.ownedCount(addr));
    const balance = Number(await c.balanceOf(addr));

    const lastActionAt = Number(await c.lastActionAt(addr));
    const lockedUntil = Number(await c.lockedUntil(addr));
    const cooldown = Number(await c.COOLDOWN());

    const cooldownLeft = lastActionAt === 0 ? 0 : lastActionAt + cooldown - now;
    const lockLeft = lockedUntil === 0 ? 0 : lockedUntil - now;

    console.log("balanceOf:", balance);
    console.log("ownedCount:", ownedCount);
    console.log("cooldown left:", fmtSecs(cooldownLeft), `(COOLDOWN=${fmtSecs(cooldown)})`);
    console.log("lock left:", fmtSecs(lockLeft), `(LOCK_DURATION=${fmtSecs(Number(await c.LOCK_DURATION()))})`);
    console.log("tokens:", tokenIds.map((x) => x.toString()).join(", "));

    for (const id of tokenIds) {
      const uri = await c.tokenURI(id);
      const meta = await c.resources(id);

      console.log(`\n  Token #${id.toString()}`);
      console.log("   uri:", uri);
      console.log("   meta.name:", meta.name);
      console.log("   meta.rtype:", meta.rtype);
      console.log("   meta.tier:", Number(meta.tier));
      console.log("   meta.value:", Number(meta.value));
      console.log("   meta.createdAt:", Number(meta.createdAt));
      console.log("   meta.lastTransferAt:", Number(meta.lastTransferAt));
    }
  }

  if (printed === 0) {
    console.log("\n(No accounts with tokens found)");
  }

  const nextOfferId = Number(await c.nextOfferId());
  console.log(`\n=== OFFERS (1..${nextOfferId - 1}) ===`);

  let any = false;
  for (let i = 1; i < nextOfferId; i++) {
    const o = await c.offers(i);
    if (!o.active) continue;

    any = true;
    console.log(`Offer #${i}`);
    console.log(" offerer:", o.offerer);
    console.log(" offeredTokenId:", o.offeredTokenId.toString());
    console.log(" requestedTokenId:", o.requestedTokenId.toString());
    console.log(" createdAt:", Number(o.createdAt));
  }

  if (!any) console.log("(no active offers)");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});