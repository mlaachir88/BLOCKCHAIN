import React, { useEffect, useState } from "react";

type Props = {
  animalKeys: string[];

  suggestedOfferedTokenId: number | null;
  suggestedRequestedTokenId: number | null;

  onMint: (animalKey: string) => Promise<void>;
  onApprove: (tokenId: number) => Promise<void>;
  onCreateOffer: (offeredTokenId: number, requestedTokenId: number) => Promise<void>;
  onAcceptOffer: (offerId: number) => Promise<void>;
  onCancelOffer: (offerId: number) => Promise<void>;
};

export default function ActionsPanel(props: Props) {
  const cardStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 14,
    background: "#fff",
  };

  const boxStyle: React.CSSProperties = {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  };

  const btnStyle: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "#f7f7f7",
  };

  const inputStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    width: "100%",
  };

  const [animalToMint, setAnimalToMint] = useState<string>(props.animalKeys[0] ?? "Lapin");

  const [tokenToApprove, setTokenToApprove] = useState<string>("");

  const [offeredTokenId, setOfferedTokenId] = useState<string>("");
  const [requestedTokenId, setRequestedTokenId] = useState<string>("");

  const [offerIdToAccept, setOfferIdToAccept] = useState<string>("");
  const [offerIdToCancel, setOfferIdToCancel] = useState<string>("");

  useEffect(() => {
    if (props.suggestedOfferedTokenId) setOfferedTokenId(String(props.suggestedOfferedTokenId));
  }, [props.suggestedOfferedTokenId]);

  useEffect(() => {
    if (props.suggestedRequestedTokenId) setRequestedTokenId(String(props.suggestedRequestedTokenId));
  }, [props.suggestedRequestedTokenId]);

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Actions</h2>

      <div style={boxStyle}>
        <h3 style={{ marginTop: 0 }}>Mint</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select
            value={animalToMint}
            onChange={(e) => setAnimalToMint(e.target.value)}
            style={{ ...inputStyle, width: "70%" }}
          >
            {props.animalKeys.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>

          <button onClick={() => props.onMint(animalToMint)} style={{ ...btnStyle, width: "30%" }}>
            Mint
          </button>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          Mint via MetaMask. Cooldown / Lock / MaxOwned rules apply.
        </div>
      </div>

      <div style={boxStyle}>
        <h3 style={{ marginTop: 0 }}>Approve token</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="tokenId"
            value={tokenToApprove}
            onChange={(e) => setTokenToApprove(e.target.value)}
            style={inputStyle}
          />
          <button onClick={() => props.onApprove(Number(tokenToApprove))} style={btnStyle}>
            Approve
          </button>
        </div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
          Needed before acceptOffer (for the requested token).
        </div>
      </div>

      <div style={boxStyle}>
        <h3 style={{ marginTop: 0 }}>Create Offer</h3>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            placeholder="offeredTokenId"
            value={offeredTokenId}
            onChange={(e) => setOfferedTokenId(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="requestedTokenId"
            value={requestedTokenId}
            onChange={(e) => setRequestedTokenId(e.target.value)}
            style={inputStyle}
          />
        </div>
        <button onClick={() => props.onCreateOffer(Number(offeredTokenId), Number(requestedTokenId))} style={btnStyle}>
          Create
        </button>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
          Tip: use "Use as offered/requested" on an NFT card to auto-fill.
        </div>
      </div>

      <div style={boxStyle}>
        <h3 style={{ marginTop: 0 }}>Accept Offer</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="offerId"
            value={offerIdToAccept}
            onChange={(e) => setOfferIdToAccept(e.target.value)}
            style={inputStyle}
          />
          <button onClick={() => props.onAcceptOffer(Number(offerIdToAccept))} style={btnStyle}>
            Accept
          </button>
        </div>
      </div>

      <div style={boxStyle}>
        <h3 style={{ marginTop: 0 }}>Cancel Offer</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="offerId"
            value={offerIdToCancel}
            onChange={(e) => setOfferIdToCancel(e.target.value)}
            style={inputStyle}
          />
          <button onClick={() => props.onCancelOffer(Number(offerIdToCancel))} style={btnStyle}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}