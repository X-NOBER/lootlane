import Link from "next/link";

const highlights = [
  { icon: "✦", title: "Curated themes", text: "Collections built around the things you love." },
  { icon: "◎", title: "A little surprise", text: "Discover new collectibles, one box at a time." },
  { icon: "♡", title: "Your collection", text: "Keep track of favorites in one cozy place." }
];

export default function HomePage() {
  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">GOOD THINGS, NICELY BOXED</p>
          <h1>Find your next<br />favorite <span>thing.</span></h1>
          <p className="hero-description">
            A bright little world of themed collectibles and thoughtful surprises.
            Browse the collection and see what catches your eye.
          </p>
          <Link className="button button-primary" href="/boxes">Explore the boxes <span aria-hidden="true">→</span></Link>
          <p className="quiet-note">A product preview — no purchases or account required.</p>
        </div>
        <div aria-label="Illustration of colorful collectible boxes" className="hero-art" role="img">
          <div className="sparkle sparkle-one">✦</div>
          <div className="sparkle sparkle-two">✧</div>
          <div className="box box-back"><span>little joys</span></div>
          <div className="box box-front"><span>GOOD<br />FINDS</span><i>✷</i></div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
        </div>
      </section>

      <section className="highlights" aria-label="What you can do">
        {highlights.map((item) => (
          <article className="highlight-card" key={item.title}>
            <span className="highlight-icon" aria-hidden="true">{item.icon}</span>
            <div><h2>{item.title}</h2><p>{item.text}</p></div>
          </article>
        ))}
      </section>
      <footer className="site-footer"><span>Made for curious collectors.</span><span>Just a preview, always for fun.</span></footer>
    </div>
  );
}
