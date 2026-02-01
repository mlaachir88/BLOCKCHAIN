import React from "react";
import { shortAddr } from "../hooks/useResourceSwap";
import type { Offer } from "../hooks/useResourceSwap";

type Props = {
  offers: Offer[];
  account: string;

  onAccept: (offerId: number) => Promise<void>;
  onCancel: (offerId: number) => Promise<void>;
};

export default function OffersList(props: Props) {
  const cardStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 14,
    background: "#fff",
  };

  const btnStyle: React.CSSProperties = {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "#f7f7f7",
    fontSize: 12,
  };

  return (
    <div style={cardStyle}>
      <h2 style={{ marginTop: 0 }}>Marketplace</h2>

      {props.offers.length === 0 && <div style={{ opacity: 0.7 }}>No offers loaded.</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {props.offers.map((o) => {
          const canCancel =
            o.active && props.account !== "-" && o.offerer.toLowerCase() === props.account.toLowerCase();

          return (
            <div
              key={o.id}
              style={{
                padding: 12,
                borderRadius: 12,
                border: "1px solid #ddd",
                background: o.active ? "#f4fff4" : "#fafafa",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <b>Offer #{o.id}</b>
                <span style={{ opacity: 0.75 }}>{o.active ? "ACTIVE" : "inactive"}</span>
              </div>

              <div style={{ fontSize: 13, marginTop: 8 }}>
                <div>offerer: {shortAddr(o.offerer)}</div>
                <div>offeredTokenId: {o.offeredTokenId}</div>
                <div>requestedTokenId: {o.requestedTokenId}</div>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button
                  style={btnStyle}
                  disabled={!o.active}
                  onClick={() => props.onAccept(o.id)}
                  title={!o.active ? "Offer inactive" : "Accept offer"}
                >
                  Accept
                </button>

                {canCancel && (
                  <button style={btnStyle} onClick={() => props.onCancel(o.id)}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
        Accept requires approving the requested token to the contract.
      </div>
    </div>
  );
}