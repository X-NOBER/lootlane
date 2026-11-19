"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemoEconomy } from "../../components/demo-economy-provider";
import { formatCredits, formatSigned, formatStars } from "../../lib/ability-economy";

export default function AccountPage() {
  const { credits, estimatedProfit, inventory, realizedProfit, sellAbility } = useDemoEconomy();
  const [notice, setNotice] = useState("");
  const inventoryProfit = inventory.reduce((profit, ability) => profit + ability.marketValue - ability.boxCost, 0);

  const handleSell = (id: string, name: string, value: number, profit: number) => {
    sellAbility(id);
    setNotice(`${name} sold for ${formatCredits(value)}. Realized profit: ${formatSigned(profit, 0)} credits.`);
  };

  return (
    <div className="page-shell subpage">
      <section className="page-intro">
        <p className="eyebrow">YOUR ABILITY VAULT</p>
        <h1>Keep your <span>finds.</span></h1>
        <p>Abilities stay in your inventory until you choose to sell them for demo credits.</p>
      </section>

      <section aria-label="Demo wallet summary" className="inventory-summary">
        <div><span>DEMO BALANCE</span><strong>{formatCredits(credits)}</strong></div>
        <div><span>REALIZED PROFIT</span><strong className={realizedProfit >= 0 ? "profit-positive" : "profit-negative"}>{formatSigned(realizedProfit, 0)} credits</strong></div>
        <div><span>INVENTORY PROFIT</span><strong className={inventoryProfit >= 0 ? "profit-positive" : "profit-negative"}>{formatSigned(inventoryProfit, 0)} credits</strong></div>
        <div><span>TOTAL EST. PROFIT</span><strong className={estimatedProfit >= 0 ? "profit-positive" : "profit-negative"}>{formatSigned(estimatedProfit, 0)} credits</strong></div>
      </section>

      {notice && <p aria-live="polite" className="economy-message">{notice}</p>}

      {inventory.length === 0 ? (
        <section className="collection-panel">
          <div className="collection-icon" aria-hidden="true">✧</div>
          <h2>Your vault is empty</h2>
          <p>Buy an Elemental Box with demo credits, spin it, and your ability will appear here.</p>
          <Link className="button button-primary" href="/open">Go to the Elemental Box <span aria-hidden="true">→</span></Link>
        </section>
      ) : (
        <section aria-label="Ability inventory" className="inventory-list">
          {inventory.map((ability) => {
            const abilityProfit = ability.marketValue - ability.boxCost;
            return (
              <article className="inventory-card" key={ability.id}>
                <div className={`inventory-emblem item-${ability.tone}`} aria-hidden="true">{ability.symbol}</div>
                <div className="inventory-description">
                  <p className="eyebrow">{ability.element.toUpperCase()} · {ability.rarity.toUpperCase()}</p>
                  <h2>{ability.name}</h2>
                  <p>{ability.condition} <span aria-hidden="true">·</span> {ability.baseDanger} → {ability.effectiveDanger}</p>
                  <p className="inventory-rating">
                    Base {formatStars(ability.baseStars)}★
                    {" "}({formatSigned(ability.conditionStarAdjustment)} condition, {formatSigned(ability.dangerStarAdjustment, 2)} danger)
                    {" "}→ <strong>{formatStars(ability.finalStars)}/5 stars</strong>
                  </p>
                  <p className="inventory-price-shift">Condition value change: {formatSigned(ability.conditionValuePercent, 0)}%</p>
                </div>
                <div className="inventory-value">
                  <span>CURRENT VALUE</span>
                  <strong>{formatCredits(ability.marketValue)}</strong>
                  <small className={abilityProfit >= 0 ? "profit-positive" : "profit-negative"}>
                    Est. net: {formatSigned(abilityProfit, 0)} credits
                  </small>
                  <button className="button button-primary sell-button" onClick={() => handleSell(ability.id, ability.name, ability.marketValue, abilityProfit)} type="button">
                    Sell for {formatCredits(ability.marketValue)}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <p className="page-bottom-note">Demo credits and values are fictional, local to this browser, and have no cash value.</p>
    </div>
  );
}
