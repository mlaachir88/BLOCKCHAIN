import { useMemo, useState } from "react";
import HeaderBar from "./components/HeaderBar";
import NftGrid from "./components/NftGrid";
import ActionsPanel from "./components/ActionsPanel";
import OffersList from "./components/OffersList";
import { useResourceSwap } from "./hooks/useResourceSwap";

type Tab = "nfts" | "actions" | "offers";

export default function App() {
  const {
    hasMetaMask,
    contractAddress,

    account,
    chainId,
    chainOk,

    msg,
    txStatus,

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
  } = useResourceSwap();

  const [tab, setTab] = useState<Tab>("nfts");

  const [selectedOfferedTokenId, setSelectedOfferedTokenId] = useState<number | null>(null);
  const [selectedRequestedTokenId, setSelectedRequestedTokenId] = useState<number | null>(null);

  const containerStyle: React.CSSProperties = useMemo(
    () => ({
      maxWidth: 1150,
      margin: "24px auto",
      padding: 16,
      fontFamily: "system-ui",
    }),
    []
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F6F7FF" }}>
      <div style={containerStyle}>
        <HeaderBar
          title="ResourceSwap DApp"
          contractAddress={contractAddress}
          hasMetaMask={hasMetaMask}
          account={account}
          chainId={chainId}
          chainOk={chainOk}
          tab={tab}
          onTabChange={setTab}
          onConnect={connect}
          onLoadNfts={loadMyNfts}
          onLoadOffers={loadOffers}
          onLoadAll={loadAll}
        />

        {msg && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 14,
              border: "1px solid #FDA29B",
              background: "#FFFBFA",
              color: "#7A271A",
              boxShadow: "0 10px 20px rgba(16,24,40,0.06)",
            }}
          >
            {msg}
          </div>
        )}

        <div style={{ marginTop: 12, color: "#667085", fontWeight: 700 }}>Tx status: {txStatus}</div>

        <div style={{ marginTop: 16 }}>
          {tab === "nfts" && (
            <NftGrid
              owned={owned}
              selectedOfferedTokenId={selectedOfferedTokenId}
              selectedRequestedTokenId={selectedRequestedTokenId}
              onPickOffered={(id) => {
                setSelectedOfferedTokenId(id);
                setTab("actions");
              }}
              onPickRequested={(id) => {
                setSelectedRequestedTokenId(id);
                setTab("actions");
              }}
            />
          )}

          {tab === "actions" && (
            <ActionsPanel
              animalKeys={animalKeys}
              suggestedOfferedTokenId={selectedOfferedTokenId}
              suggestedRequestedTokenId={selectedRequestedTokenId}
              onMint={mintFromWeb}
              onApprove={approveToken}
              onCreateOffer={createOffer}
              onAcceptOffer={acceptOffer}
              onCancelOffer={cancelOffer}
            />
          )}

          {tab === "offers" && (
            <OffersList
              offers={offers}
              account={account}
              onAccept={acceptOffer}
              onCancel={cancelOffer}
            />
          )}
        </div>
      </div>
    </div>
  );
}