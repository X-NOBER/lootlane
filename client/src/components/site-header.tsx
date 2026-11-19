import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/boxes", label: "Explore boxes" },
  { href: "/account", label: "My collection" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link aria-label="Lootlane home" className="brand" href="/">
        <span className="brand-mark">L</span>
        lootlane
      </Link>
      <nav aria-label="Main navigation" className="navigation">
        {links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <span className="preview-pill">PREVIEW</span>
    </header>
  );
}
