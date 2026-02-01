import { useEffect, useMemo, useState } from "react";
import { BrowserProvider } from "ethers";
import { CONTRACT_ADDRESS, HARDHAT_CHAIN_ID } from "./config";

declare global {
  interface Window {
    ethereum?: any;
  }
}

function shortAddr(a: string) {
  if (!a || a === "-") return "-";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function App() {
  const hasMetaMask = !!window.ethereum;

  const [account, setAccount] = useState<string>("-");
  const [chainId, setChainId] = useState<number | null>(null);
  const [msg, setMsg] = useState<string>("");

  const provider = useMemo(() => {
    if (!hasMetaMask) return null;
    return new BrowserProvider(window.ethereum);
  }, [hasMetaMask]);

  const chainOk = chainId === HARDHAT_CHAIN_ID;

  async function refresh() {
    if (!provider) return;

    const net = await provider.getNetwork();
    setChainId(Number(net.chainId));

    const accs = await provider.send("eth_accounts", []);
    setAccount(accs?.[0] ?? "-");
  }

  async function connect() {
    if (!provider) return;
    setMsg("");

    try {
      const accs = await provider.send("eth_requestAccounts", []);
      setAccount(accs?.[0] ?? "-");

      const net = await provider.getNetwork();
      setChainId(Number(net.chainId));
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Unknown error");
    }
  }

  useEffect(() => {
    refresh();
  }, [provider]);

  const cardStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 14,
    background: "#fff",
    marginTop: 16,
  };

  const btnStyle: React.CSSProperties = {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #ddd",
    cursor: "pointer",
    background: "#f7f7f7",
  };

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ margin: 0 }}>ResourceSwap Frontend</h1>

      <div style={{ marginTop: 6, opacity: 0.75 }}>
        Contract: <span style={{ fontFamily: "monospace" }}>{CONTRACT_ADDRESS}</span>
      </div>

      {!hasMetaMask && (
        <div style={cardStyle}>
          MetaMask not detected. Install MetaMask to use this DApp.
        </div>
      )}

      {hasMetaMask && (
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={connect} style={btnStyle}>
              Connect MetaMask
            </button>

            <div>
              <div>
                <b>Account:</b> {shortAddr(account)}
              </div>
              <div>
                <b>Chain:</b> {chainId ?? "-"}{" "}
                {chainOk ? (
                  <span style={{ color: "green" }}>(OK)</span>
                ) : (
                  <span style={{ color: "crimson" }}>(Switch to Hardhat Local 31337)</span>
                )}
              </div>
            </div>

            <div style={{ marginLeft: "auto" }}>
              <button onClick={refresh} style={btnStyle}>
                Refresh
              </button>
            </div>
          </div>

          {msg && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 12,
                border: "1px solid #f1b0b7",
                background: "#fdecef",
                color: "#7a1c2a",
              }}
            >
              {msg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}