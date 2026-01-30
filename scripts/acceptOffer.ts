import { network } from "hardhat";

const CONTRACT = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function fmtSecs(s: number) {
  if (s <= 0) return "0s";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}

function getRevertData(err: any): string | undefined {
  return (
    err?.data ??
    err?.error?.data ??
    err?.info?.error?.data ??
    err?.info?.data ??
    err?.cause?.data
  );
}

async function decodeError(c: any, err: any): Promise<string> {
  const data = getRevertData(err);
  if (data && typeof data === "string" && data.startsWith("0x")) {
    try {
      const parsed = c.interface.parseError(data);

      const name = String(parsed.name ?? "").toLowerCase();
      if (name.includes("insufficientapproval")) {
        return "Revert: token not approved (run approve.ts for the owner's token)";
      }
      if (name.includes("nonexistent")) {
        return "Revert: token does not exist";
      }

      return `Revert: ${parsed.name}(${parsed.args?.map((x: any) => x.toString()).join(", ") ?? ""})`;
    } catch {}

    if (data.startsWith("0x08c379a0")) {
      try {
        const { ethers } = await network.connect();
        const reason = ethers.AbiCoder.defaultAbiCoder().decode(["string"], "0x" + data.slice(10))[0];
        return `Revert: ${reason}`;
      } catch {}
    }
  }

  return err?.shortMessage ?? err?.reason ?? err?.message ?? "Unknown error";
}

async function isContractApprovedForToken(c: any, tokenId: bigint, owner: string): Promise<boolean> {
  try {
    const approved = await c.getApproved(tokenId);
    if (approved && approved.toLowerCase() === CONTRACT.toLowerCase()) return true;
  } catch {
    return false;
  }
  try {
    return await c.isApprovedForAll(owner, CONTRACT);
  } catch {
    return false;
  }
}

async function main() {
  const { ethers } = await network.connect();

  const acc = parseInt(process.env.ACC ?? "0", 10);
  const offerId = BigInt(process.env.OFFER_ID ?? "0");

  const signers = await ethers.getSigners();
  const signer = signers[acc];
  if (!signer) throw new Error(`Invalid ACC: ${acc}`);

  const me = await signer.getAddress();
  const c = await ethers.getContractAt("ResourceSwap", CONTRACT, signer);

  console.log("Using account:", acc, me);
  console.log("Accept offer:", offerId.toString());

  const now = Number((await c.runner.provider.getBlock("latest")).timestamp);
  const cooldown = Number(await c.COOLDOWN());
  const lastActionAt = Number(await c.lastActionAt(me));
  const lockedUntil = Number(await c.lockedUntil(me));

  const cooldownLeft = lastActionAt === 0 ? 0 : lastActionAt + cooldown - now;
  const lockLeft = lockedUntil === 0 ? 0 : lockedUntil - now;

  if (lockLeft > 0) {
    console.log("Blocked: lock active for", fmtSecs(lockLeft));
    return;
  }
  if (cooldownLeft > 0) {
    console.log("Blocked: cooldown remaining", fmtSecs(cooldownLeft));
    return;
  }

  let o: any;
  try {
    o = await c.offers(offerId);
  } catch (err) {
    console.log("Invalid offerId or offers() read error:", await decodeError(c, err));
    return;
  }

  if (!o.active) {
    console.log("Offer inactive.");
    return;
  }

  const requestedId = o.requestedTokenId as bigint;
  const offeredId = o.offeredTokenId as bigint;
  const offerer = (o.offerer as string).toLowerCase();

  let ownerRequested: string;
  try {
    ownerRequested = await c.ownerOf(requestedId);
  } catch {
    console.log("Requested token not found:", requestedId.toString());
    return;
  }
  if (ownerRequested.toLowerCase() !== me.toLowerCase()) {
    console.log("Not owner of requested token. Cannot accept this offer.");
    return;
  }

  let ownerOffered: string;
  try {
    ownerOffered = await c.ownerOf(offeredId);
  } catch {
    console.log("Offered token not found:", offeredId.toString());
    return;
  }
  if (ownerOffered.toLowerCase() !== offerer) {
    console.log("Offer invalid: offerer is no longer the owner of offered token.");
    return;
  }

  const okOffererApproval = await isContractApprovedForToken(c, offeredId, ownerOffered);
  if (!okOffererApproval) {
    console.log("Blocked: offered token not approved for contract.");
    console.log("Fix: run approve.ts with ACC = offerer, TOKEN =", offeredId.toString());
    return;
  }

  const okMeApproval = await isContractApprovedForToken(c, requestedId, me);
  if (!okMeApproval) {
    console.log("Blocked: requested token not approved for contract.");
    console.log("Fix: run approve.ts with ACC =", acc, "TOKEN =", requestedId.toString());
    return;
  }

  try {
    const tx = await c.acceptOffer(offerId);
    console.log("acceptOffer tx:", tx.hash);
    const receipt = await tx.wait();
    console.log("Offer accepted - block:", receipt?.blockNumber?.toString());

    console.log("New owner (offered):", await c.ownerOf(offeredId));
    console.log("New owner (requested):", await c.ownerOf(requestedId));
  } catch (err) {
    console.log("acceptOffer failed:", await decodeError(c, err));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});