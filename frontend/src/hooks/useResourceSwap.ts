import { useCallback, useEffect, useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import abiJson from "../abi/ResourceSwap.json";
import { ANIMALS, CONTRACT_ADDRESS, HARDHAT_CHAIN_ID, ipfsToHttp } from "../config";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type TxStatus = "idle" | "pending" | "success" | "error";

export type NftMeta = {
  name?: string;
  description?: string;
  type?: string;
  tier?: number;
  value?: number;
  image?: string;
};

export type OwnedNft = {
  tokenId: number;
  tokenUri: string;
  meta?: NftMeta;
};

export type Offer = {
  id: number;
  offerer: string;
  offeredTokenId: number;
  requestedTokenId: number;
  active: boolean;
  createdAt: number;
};

export function shortAddr(a: string) {
  if (!a || a === "-") return "-";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function parseError(e: any): string {
  if (!e) return "Unknown error";
  if (typeof e === "string") return e;
  if (e?.shortMessage) return e.shortMessage;
  if (e?.reason) return e.reason;
  if (e?.message) return e.message;
  return "Unknown error";
}

async function safeJsonFetch(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  return res.json();
}

export function useResourceSwap() {
  const hasMetaMask = !!window.ethereum;

  const [account, setAccount] = useState<string>("-");
  const [chainId, setChainId] = useState<number | null>(null);

  const [msg, setMsg] = useState<string>("");
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");

  const [owned, setOwned] = useState<OwnedNft[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  const animalKeys = useMemo(() => Object.keys(ANIMALS), []);

  const provider = useMemo(() => {
    if (!hasMetaMask) return null;
    return new BrowserProvider(window.ethereum);
  }, [hasMetaMask]);

  const abi = useMemo(() => {
    const a: any = abiJson as any;
    return a?.abi ?? a;
  }, []);

  const readContract = useMemo(() => {
    if (!provider) return null;
    return new Contract(CONTRACT_ADDRESS, abi, provider);
  }, [provider, abi]);

  const chainOk = chainId === HARDHAT_CHAIN_ID;

  const clearMsg = useCallback(() => setMsg(""), []);

  const refreshChainAndAccount = useCallback(async () => {
    if (!provider) return;
    const net = await provider.getNetwork();
    setChainId(Number(net.chainId));

    const accs = await provider.send("eth_accounts", []);
    setAccount(accs?.[0] ?? "-");
  }, [provider]);

  const connect = useCallback(async () => {
    if (!provider) return;
    setMsg("");
    try {
      const accs = await provider.send("eth_requestAccounts", []);
      setAccount(accs?.[0] ?? "-");

      const net = await provider.getNetwork();
      setChainId(Number(net.chainId));
    } catch (e) {
      setMsg(parseError(e));
    }
  }, [provider]);

  const withSigner = useCallback(async () => {
    if (!provider) throw new Error("No provider");
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, abi, signer);
  }, [provider, abi]);

  const fetchJsonFromIpfs = useCallback(async (ipfsUri: string) => {
    const url = ipfsToHttp(ipfsUri);
    return safeJsonFetch(url);
  }, []);

  const loadMyNfts = useCallback(async () => {
    if (!readContract || account === "-") return;
    setMsg("");
    try {
      const tokenIds: bigint[] = await readContract.tokensOfOwner(account);
      const items: OwnedNft[] = [];

      for (const idBn of tokenIds) {
        const tokenId = Number(idBn);
        const tokenUri: string = await readContract.tokenURI(tokenId);

        let meta: NftMeta | undefined = undefined;
        try {
          meta = await fetchJsonFromIpfs(tokenUri);
        } catch {
          meta = undefined;
        }

        items.push({ tokenId, tokenUri, meta });
      }

      setOwned(items);
    } catch (e) {
      setMsg(parseError(e));
    }
  }, [readContract, account, fetchJsonFromIpfs]);

  const loadOffers = useCallback(async () => {
    if (!readContract) return;
    setMsg("");
    try {
      const nextOfferIdBn: bigint = await readContract.nextOfferId();
      const maxId = Number(nextOfferIdBn) - 1;

      const list: Offer[] = [];
      for (let id = 1; id <= maxId; id++) {
        const o = await readContract.offers(id);
        list.push({
          id,
          offerer: String(o.offerer ?? ""),
          offeredTokenId: Number(o.offeredTokenId),
          requestedTokenId: Number(o.requestedTokenId),
          active: Boolean(o.active),
          createdAt: Number(o.createdAt),
        });
      }

      list.sort((a, b) => Number(b.active) - Number(a.active));
      setOffers(list);
    } catch (e) {
      setMsg(parseError(e));
    }
  }, [readContract]);

  const loadAll = useCallback(async () => {
    await loadMyNfts();
    await loadOffers();
  }, [loadMyNfts, loadOffers]);

  const mintFromWeb = useCallback(
    async (animalKey: string) => {
      setMsg("");
      setTxStatus("pending");
      try {
        const c = await withSigner();

        const tokenUri = ANIMALS[animalKey];
        if (!tokenUri) throw new Error("Unknown animal");

        const meta = await fetchJsonFromIpfs(tokenUri);
        const name = meta.name ?? animalKey;
        const rtype = meta.type ?? "animal";
        const tier = Number(meta.tier ?? 1);
        const value = Number(meta.value ?? 0);

        const tx = await c.mintResource(name, rtype, tier, value, tokenUri);
        await tx.wait();

        setTxStatus("success");
        await loadMyNfts();
      } catch (e) {
        setTxStatus("error");
        setMsg(parseError(e));
      }
    },
    [withSigner, fetchJsonFromIpfs, loadMyNfts]
  );

  const approveToken = useCallback(
    async (tokenId: number) => {
      setMsg("");
      setTxStatus("pending");
      try {
        if (!tokenId) throw new Error("Enter a valid tokenId");
        const c = await withSigner();

        const tx = await c.approve(CONTRACT_ADDRESS, tokenId);
        await tx.wait();

        setTxStatus("success");
      } catch (e) {
        setTxStatus("error");
        setMsg(parseError(e));
      }
    },
    [withSigner]
  );

  const createOffer = useCallback(
    async (offeredTokenId: number, requestedTokenId: number) => {
      setMsg("");
      setTxStatus("pending");
      try {
        if (!offeredTokenId || !requestedTokenId) throw new Error("Enter valid token ids");
        const c = await withSigner();

        const tx = await c.createOffer(offeredTokenId, requestedTokenId);
        await tx.wait();

        setTxStatus("success");
        await loadOffers();
        await loadMyNfts();
      } catch (e) {
        setTxStatus("error");
        setMsg(parseError(e));
      }
    },
    [withSigner, loadOffers, loadMyNfts]
  );

  const acceptOffer = useCallback(
    async (offerId: number) => {
      setMsg("");
      setTxStatus("pending");
      try {
        if (!offerId) throw new Error("Enter offerId");
        const c = await withSigner();

        const o = await c.offers(offerId);
        if (!Boolean(o.active)) throw new Error("Offer inactive");

        const requested = Number(o.requestedTokenId);
        const approved = await c.getApproved(requested);
        if (String(approved).toLowerCase() !== CONTRACT_ADDRESS.toLowerCase()) {
          throw new Error("Token not approved for contract.");

        }

        const tx = await c.acceptOffer(offerId);
        await tx.wait();

        setTxStatus("success");
        await loadOffers();
        await loadMyNfts();
      } catch (e) {
        setTxStatus("error");
        setMsg(parseError(e));
      }
    },
    [withSigner, loadOffers, loadMyNfts]
  );

  const cancelOffer = useCallback(
    async (offerId: number) => {
      setMsg("");
      setTxStatus("pending");
      try {
        if (!offerId) throw new Error("Enter offerId");
        const c = await withSigner();

        const tx = await c.cancelOffer(offerId);
        await tx.wait();

        setTxStatus("success");
        await loadOffers();
      } catch (e) {
        setTxStatus("error");
        setMsg(parseError(e));
      }
    },
    [withSigner, loadOffers]
  );

  useEffect(() => {
    refreshChainAndAccount();
  }, [refreshChainAndAccount]);

  useEffect(() => {
    if (!window.ethereum) return;

    const onAccountsChanged = (accs: string[]) => {
      setAccount(accs?.[0] ?? "-");
      setOwned([]);
    };

    const onChainChanged = (hexChainId: string) => {
      setChainId(parseInt(hexChainId, 16));
      setOwned([]);
      setOffers([]);
    };

    window.ethereum.on("accountsChanged", onAccountsChanged);
    window.ethereum.on("chainChanged", onChainChanged);

    return () => {
      window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener("chainChanged", onChainChanged);
    };
  }, []);

  return {
    hasMetaMask,
    contractAddress: CONTRACT_ADDRESS,
    hardhatChainId: HARDHAT_CHAIN_ID,

    account,
    chainId,
    chainOk,

    msg,
    txStatus,
    clearMsg,

    owned,
    offers,

    animalKeys,

    connect,
    loadMyNfts,
    loadOffers,
    loadAll,

    mintFromWeb,
    approveToken,
    createOffer,
    acceptOffer,
    cancelOffer,
  };
}