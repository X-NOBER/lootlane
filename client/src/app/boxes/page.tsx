import Link from "next/link";

const boxes = [
  { number: "01", name: "Desk Daydreams", category: "FOR YOUR WORKSPACE", description: "Tiny upgrades for your favorite corner.", color: "lavender", symbol: "✿", items: "Stationery · Desk accessories" },
  { number: "02", name: "Cozy Companion", category: "FOR SLOW DAYS", description: "A few soft comforts for a quiet moment.", color: "peach", symbol: "☁", items: "Comfort · Home goods" },
  { number: "03", name: "Pocket Planet", category: "FOR THE CURIOUS", description: "Small wonders inspired by the natural world.", color: "mint", symbol: "✦", items: "Nature · Mini collectibles" }
];

export default function BoxesPage() {
  return (
    <div className="page-shell subpage">
      <section className="page-intro">
        <p className="eyebrow">THE COLLECTION</p>
        <h1>Pick a little <span>curiosity.</span></h1>
        <p>Browse our themed box concepts. This preview is a catalog only—nothing is for sale.</p>
      </section>
      <section className="box-grid" aria-label="Box concepts">
        {boxes.map((box) => (
          <article className="catalog-card" key={box.number}>
            <div className={`catalog-art ${box.color}`}><span className="catalog-number">{box.number}</span><span className="catalog-symbol" aria-hidden="true">{box.symbol}</span><span className="catalog-art-label">A LITTLE<br />SURPRISE</span></div>
            <div className="catalog-info">
              <p className="eyebrow">{box.category}</p>
              <h2>{box.name}</h2>
              <p>{box.description}</p>
              <span className="item-tags">{box.items}</span>
              <Link className="catalog-action" href="/open">Try a sample spin <span aria-hidden="true">→</span></Link>
            </div>
          </article>
        ))}
      </section>
      <div className="page-bottom-note">Each box is a concept for exploring themes—not an offer to purchase.</div>
      <Link className="text-link" href="/account">See your collection preview <span aria-hidden="true">→</span></Link>
    </div>
  );
}
