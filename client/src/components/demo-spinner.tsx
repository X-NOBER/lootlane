"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useDemoEconomy } from "@/components/demo-economy-provider";
import {
  ABILITIES,
  BOX_COST,
  BOX_NAME,
  formatCredits,
  formatSigned,
  formatStars,
  rollAbility,
  type AbilityDefinition,
  type RolledAbility
} from "@/lib/ability-economy";

const REEL_LENGTH = 44;
const START_INDEX = 2;
const WINNING_INDEX = 36;
const SPIN_DURATION = 5200;

function makeReel(winner: AbilityDefinition) {
  return Array.from({ length: REEL_LENGTH }, (_, index) =>
    index === WINNING_INDEX ? winner : ABILITIES[(index * 5 + Math.floor(index / 3)) % ABILITIES.length]
  );
}

function StarDisplay({ value }: { value: number }) {
  return (
    <div aria-label={`${formatStars(value)} out of 5 stars`} className="ability-stars">
      {Array.from({ length: 5 }, (_, index) => {
        const remaining = value - index;
        const className = remaining >= 1 ? "star-filled" : remaining >= 0.5 ? "star-half" : "";
        return <span aria-hidden="true" className={className} key={index}>★</span>;
      })}
      <span className="star-caption">{formatStars(value)}/5</span>
    </div>
  );
}

export function DemoSpinner() {
  const {
    addAbility,
    boxesOwned,
    buyBox: purchaseBox,
    credits,
    estimatedProfit,
    ready,
    storageError
  } = useDemoEconomy();
  const [winner, setWinner] = useState<RolledAbility | null>(null);
  const [reel, setReel] = useState(() => makeReel(ABILITIES[0]));
  const [offset, setOffset] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [walletMessage, setWalletMessage] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const spinButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const frameRefs = useRef<number[]>([]);

  const closeResult = useCallback(() => {
    setIsResultOpen(false);
    spinButtonRef.current?.focus();
  }, []);

  const centeredOffset = useCallback((index: number) => {
    const viewport = viewportRef.current;
    const item = itemRefs.current[index];
    if (!viewport || !item) return 0;
    return viewport.clientWidth / 2 - (item.offsetLeft + item.clientWidth / 2);
  }, []);

  const activeIndex = isSpinning || winner ? WINNING_INDEX : START_INDEX;

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const centerActiveItem = () => setOffset(centeredOffset(activeIndex));
    const observer = new ResizeObserver(centerActiveItem);
    observer.observe(viewport);
    centerActiveItem();

    return () => observer.disconnect();
  }, [activeIndex, centeredOffset]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      frameRefs.current.forEach(window.cancelAnimationFrame);
    };
  }, []);

  useEffect(() => {
    if (!isResultOpen) return;

    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeResult();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeResult, isResultOpen]);

  const spin = () => {
    if (isSpinning || !ready || boxesOwned < 1) return;

    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    frameRefs.current.forEach(window.cancelAnimationFrame);
    setIsSpinning(false);
    setWinner(null);
    setIsResultOpen(false);
    setWalletMessage("");

    const selectedAbility = ABILITIES[Math.floor(Math.random() * ABILITIES.length)];
    const nextWinner = rollAbility(selectedAbility);
    setReel(makeReel(nextWinner));
    setOffset(centeredOffset(START_INDEX));

    frameRefs.current = [
      window.requestAnimationFrame(() => {
        frameRefs.current = [
          window.requestAnimationFrame(() => {
            setIsSpinning(true);
            setOffset(centeredOffset(WINNING_INDEX));
          })
        ];
      })
    ];

    timeoutRef.current = window.setTimeout(() => {
      setIsSpinning(false);
      setWinner(nextWinner);
      addAbility(nextWinner);
      setIsResultOpen(true);
      timeoutRef.current = null;
    }, SPIN_DURATION);
  };

  const handleBuyBox = () => {
    if (!ready || credits < BOX_COST) return;
    purchaseBox();
    setWalletMessage(`${BOX_NAME} purchased. Your box is ready to open.`);
  };
  const netProfit = winner ? winner.marketValue - BOX_COST : 0;

  return (
    <section className="spinner-panel" aria-label="Demo box opening">
      <div className="spinner-heading">
        <div>
          <p className="eyebrow">THE ELEMENTAL BOX</p>
          <h2>Open a box. Find an ability.</h2>
        </div>
        <span className="demo-badge">DEMO ONLY</span>
      </div>

      <div className="demo-wallet">
        <div className="wallet-stat"><span>DEMO BALANCE</span><strong>{formatCredits(credits)}</strong></div>
        <div className="wallet-stat"><span>BOXES READY</span><strong>{boxesOwned}</strong></div>
        <div className="wallet-stat"><span>EST. TOTAL PROFIT</span><strong className={estimatedProfit >= 0 ? "profit-positive" : "profit-negative"}>{formatSigned(estimatedProfit, 0)} credits</strong></div>
        <button className="button button-primary buy-box-button" disabled={!ready || credits < BOX_COST || isSpinning} onClick={handleBuyBox} type="button">
          Buy {BOX_NAME} · {formatCredits(BOX_COST)}
        </button>
      </div>
      {storageError && <p className="economy-alert" role="alert">{storageError}</p>}
      {walletMessage && <p aria-live="polite" className="economy-message">{walletMessage}</p>}

      <div className="spinner-viewport" ref={viewportRef} role="img" aria-label="A horizontal carousel of fictional elemental abilities">
        <div aria-hidden="true" className="spinner-marker">
          <span className="marker-cap" />
          <span className="marker-line" />
          <span className="marker-label">YOUR ABILITY</span>
        </div>
        <div
          className={`spinner-track${isSpinning ? " spinner-track-moving" : ""}`}
          style={{ transform: `translate3d(${offset}px, 0, 0)` }}
        >
          {reel.map((item, index) => (
            <div
              aria-hidden="true"
              className={`spinner-item item-${item.tone}`}
              key={`${index}-${item.name}`}
              ref={(element) => { itemRefs.current[index] = element; }}
            >
              <span className="spinner-item-symbol">{item.symbol}</span>
              <span className="spinner-item-name">{item.name}</span>
              <span className="spinner-item-element">{item.element} · {item.rarity}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="spinner-controls">
        <button className="button button-primary spin-button" disabled={isSpinning || !ready || boxesOwned < 1} onClick={spin} ref={spinButtonRef} type="button">
          {isSpinning ? "Opening box…" : boxesOwned > 0 ? "Open a box" : "Buy a box to spin"}
          <span aria-hidden="true">{isSpinning ? "✦" : "→"}</span>
        </button>
        <p aria-live="polite" className="spin-result">
          {isSpinning
            ? "The ability carousel is moving…"
            : boxesOwned > 0
              ? `${boxesOwned} box${boxesOwned === 1 ? "" : "es"} ready to open.`
              : `Buy an ${BOX_NAME} with demo credits to begin.`}
        </p>
      </div>
      <p className="spinner-disclaimer">Demo credits are fictional and stay in this browser. No real-money payments or backend gambling.</p>

      {isResultOpen && winner && (
        <div className="ability-overlay">
          <section aria-labelledby="ability-result-title" aria-modal="true" className="ability-result-card" role="dialog">
            <div className="ability-result-heading">
              <span>ABILITY REVEALED</span>
              <button aria-label="Close ability details" className="ability-close" onClick={closeResult} ref={closeButtonRef} type="button">×</button>
            </div>
            <div className={`ability-emblem item-${winner.tone}`} aria-hidden="true">{winner.symbol}</div>
            <p className="ability-element-label">{winner.element.toUpperCase()} ELEMENT</p>
            <h2 id="ability-result-title">{winner.name}</h2>
            <StarDisplay value={winner.finalStars} />
            <dl className="ability-details">
              <div><dt>Element</dt><dd>{winner.element}</dd></div>
              <div><dt>Condition</dt><dd>{winner.condition}</dd></div>
              <div><dt>Rarity</dt><dd className={`rarity-${winner.rarity.toLowerCase()}`}>{winner.rarity}</dd></div>
              <div><dt>Base danger</dt><dd className={`danger-${winner.baseDanger.toLowerCase()}`}>{winner.baseDanger}</dd></div>
              <div><dt>Adjusted danger</dt><dd className={`danger-${winner.effectiveDanger.toLowerCase()}`}>{winner.effectiveDanger}</dd></div>
            </dl>
            <section className="result-breakdown" aria-label="Star rating calculation">
              <h3>STAR RATING</h3>
              <dl className="breakdown-list">
                <div><dt>Base ability</dt><dd>{formatStars(winner.baseStars)} stars</dd></div>
                <div><dt>Condition effect</dt><dd>{formatSigned(winner.conditionStarAdjustment)} stars</dd></div>
                <div><dt>Adjusted danger effect</dt><dd>{formatSigned(winner.dangerStarAdjustment, 2)} stars</dd></div>
                <div className="breakdown-total"><dt>Final rating</dt><dd>{formatStars(winner.finalStars)} / 5</dd></div>
              </dl>
              <p>Worn conditions reduce danger; danger and condition both affect the final half-star rating.</p>
            </section>
            <section className="result-breakdown value-breakdown" aria-label="Ability value and profit calculation">
              <h3>DEMO VALUE</h3>
              <dl className="breakdown-list">
                <div><dt>Starting value</dt><dd>{formatCredits(winner.baseValue)}</dd></div>
                <div><dt>Condition value change</dt><dd>{formatSigned(winner.conditionValuePercent, 0)}%</dd></div>
                <div><dt>Star rating multiplier</dt><dd>×{winner.starValueMultiplier.toFixed(2)}</dd></div>
                <div><dt>Final ability value</dt><dd>{formatCredits(winner.marketValue)}</dd></div>
                <div><dt>Box cost</dt><dd>{formatCredits(BOX_COST)}</dd></div>
                <div className={netProfit >= 0 ? "breakdown-total profit-positive" : "breakdown-total profit-negative"}>
                  <dt>Estimated net profit</dt><dd>{formatSigned(netProfit, 0)} credits</dd>
                </div>
              </dl>
              <p>Value = starting value × condition adjustment × star rating multiplier.</p>
            </section>
            <p className="rarity-note">This ability was added to your inventory. Sell it any time from your collection page.</p>
            <button className="button button-primary ability-dismiss" onClick={closeResult} type="button">Back to the carousel</button>
            <p className="ability-fine-print">Fictional abilities and demo credits only. No real-money value.</p>
          </section>
        </div>
      )}
    </section>
  );
}
