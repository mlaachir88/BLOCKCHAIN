import React from "react";
import { shortAddr } from "../hooks/useResourceSwap";

type Tab = "nfts" | "actions" | "offers";

type Props = {
  title: string;
  contractAddress: string;

  hasMetaMask: boolean;
  account: string;
  chainId: number | null;
  chainOk: boolean;

  tab: Tab;
  onTabChange: (t: Tab) => void;

  onConnect: () => void;
  onLoadNfts: () => void;
  onLoadOffers: () => void;
  onLoadAll: () => void;
};

export default function HeaderBar(props: Props) {
  const accent = "#6D5DF6";
  const border = "#E8E9F3";
  const text = "#101828";
  const muted = "#667085";
  const cardBg = "#FFFFFF";

  const card: React.CSSProperties = {
    border: `1px solid ${border}`,
    borderRadius: 16,
    padding: 16,
    background: cardBg,
    boxShadow: "0 12px 30px rgba(16, 24, 40, 0.08)",
  };

  const btn: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 12,
    border: `1px solid ${border}`,
    cursor: "pointer",
    background: "#F7F7FF",
    fontWeight: 600,
    color: text,
  };

  const primaryBtn: React.CSSProperties = {
    ...btn,
    background: accent,
    border: `1px solid ${accent}`,
    color: "#fff",
  };

  const tabsWrap: React.CSSProperties = {
    display: "inline-flex",
    gap: 6,
    padding: 6,
    borderRadius: 999,
    border: `1px solid ${border}`,
    background: "#F7F7FF",
    marginTop: 14,
  };

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    background: active ? "#111" : "transparent",
    color: active ? "#fff" : text,
    fontWeight: 700,
    letterSpacing: 0.2,
  });

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 54, letterSpacing: -1.2, color: text }}>{props.title}</h1>
          <div style={{ marginTop: 6, color: muted, fontSize: 16 }}>Marketplace & swaps</div>
          <div style={{ marginTop: 8, color: muted }}>
            Contract: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", color: text }}>{props.contractAddress}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button onClick={props.onLoadNfts} style={btn}>Load My NFTs</button>
          <button onClick={props.onLoadOffers} style={btn}>Load Offers</button>
          <button onClick={props.onLoadAll} style={btn}>Load All</button>
        </div>
      </div>

      {!props.hasMetaMask && (
        <div style={{ ...card, marginTop: 16, color: muted }}>
          MetaMask not detected. Install MetaMask to use this DApp.
        </div>
      )}

      {props.hasMetaMask && (
        <div style={{ ...card, marginTop: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <button onClick={props.onConnect} style={primaryBtn}>Connect MetaMask</button>

          <div style={{ color: text }}>
            <div style={{ fontSize: 15 }}>
              <b>Account:</b> {shortAddr(props.account)}
            </div>
            <div style={{ fontSize: 15, marginTop: 4 }}>
              <b>Chain:</b> {props.chainId ?? "-"}{" "}
              {props.chainOk ? (
                <span style={{ color: "#12B76A", fontWeight: 700 }}>OK</span>
              ) : (
                <span style={{ color: "#D92D20", fontWeight: 700 }}>Switch to 31337</span>
              )}
            </div>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <div style={tabsWrap}>
              <button style={tabBtn(props.tab === "nfts")} onClick={() => props.onTabChange("nfts")}>My NFTs</button>
              <button style={tabBtn(props.tab === "offers")} onClick={() => props.onTabChange("offers")}>Marketplace</button>
              <button style={tabBtn(props.tab === "actions")} onClick={() => props.onTabChange("actions")}>Actions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}