import React from "react";
import type { OwnedNft } from "../hooks/useResourceSwap";
import { ipfsToHttp } from "../config";

type Props = {
  owned: OwnedNft[];
  selectedOfferedTokenId: number | null;
  selectedRequestedTokenId: number | null;
  onPickOffered: (tokenId: number) => void;
  onPickRequested: (tokenId: number) => void;
};

export default function NftGrid(props: Props) {
  const accent = "#6D5DF6";
  const border = "#E8E9F3";
  const text = "#101828";
  const muted = "#667085";

  const wrap: React.CSSProperties = {
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: 16,
    background: "#fff",
    boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
  };

  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 18,
    alignItems: "start",
    marginTop: 14,
  };

  const card: React.CSSProperties = {
    border: `1px solid ${border}`,
    borderRadius: 18,
    background: "#fff",
    overflow: "hidden",
    boxShadow: "0 10px 24px rgba(16, 24, 40, 0.06)",
    maxWidth: 380,
    justifySelf: "start",
  };

  const header: React.CSSProperties = {
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  };

  const title: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 900,
    color: text,
    letterSpacing: -0.2,
    lineHeight: 1.1,
  };

  const metaRight: React.CSSProperties = {
    fontSize: 13,
    color: muted,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };

  const imgBox: React.CSSProperties = {
    width: "100%",
    aspectRatio: "1 / 1",
    background: "#F3F4F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  };

  const body: React.CSSProperties = {
    padding: 14,
    borderTop: `1px solid ${border}`,
  };

  const stats: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
  };

  const statLabel: React.CSSProperties = { fontSize: 12, color: muted };
  const statValue: React.CSSProperties = { fontSize: 16, fontWeight: 900, color: text };

  const primaryBtn: React.CSSProperties = {
    width: "100%",
    marginTop: 12,
    padding: "12px 14px",
    borderRadius: 14,
    border: `1px solid ${accent}`,
    background: accent,
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 15,
  };

  const secondaryBtn: React.CSSProperties = {
    width: "100%",
    marginTop: 10,
    padding: "10px 14px",
    borderRadius: 14,
    border: `1px solid ${border}`,
    background: "#fff",
    color: text,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
  };

  return (
    <div style={wrap}>
      <h2 style={{ marginTop: 0, marginBottom: 6, fontSize: 26, color: text }}>My NFTs</h2>
      <div style={{ color: muted, fontSize: 15 }}>Select an NFT as offered/requested.</div>

      {props.owned.length === 0 && <div style={{ marginTop: 14, color: muted }}>No NFTs loaded.</div>}

      <div style={grid}>
        {props.owned.map((n, idx) => {
          const img = n.meta?.image ? ipfsToHttp(n.meta.image) : "";
          const letter = String.fromCharCode(65 + (idx % 26));
          const name = n.meta?.name ?? `Token #${n.tokenId}`;

          const isOffered = props.selectedOfferedTokenId === n.tokenId;
          const isRequested = props.selectedRequestedTokenId === n.tokenId;

          return (
            <div
              key={n.tokenId}
              style={{
                ...card,
                outline: isOffered || isRequested ? "2px solid #111" : "none",
              }}
            >
              <div style={header}>
                <div>
                  <div style={title}>{letter}. {name}</div>
                  <div style={{ marginTop: 6, color: muted, fontSize: 13, fontWeight: 700 }}>
                    token #{n.tokenId}
                  </div>
                </div>
                <div style={metaRight}>tier {n.meta?.tier ?? "-"}</div>
              </div>

              <div style={imgBox}>
                {img ? <img src={img} alt={name} style={imgStyle} /> : <div style={{ color: muted, fontWeight: 700 }}>No image</div>}
              </div>

              <div style={body}>
                <div style={stats}>
                  <div>
                    <div style={statLabel}>Type</div>
                    <div style={statValue}>{n.meta?.type ?? "-"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={statLabel}>Value</div>
                    <div style={statValue}>{n.meta?.value ?? "-"}</div>
                  </div>
                </div>

                <button style={primaryBtn} onClick={() => props.onPickOffered(n.tokenId)}>
                  Use as offered
                </button>
                <button style={secondaryBtn} onClick={() => props.onPickRequested(n.tokenId)}>
                  Use as requested
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}