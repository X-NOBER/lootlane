import { DemoSpinner } from "@/components/demo-spinner";

export default function OpenPage() {
  return (
    <div className="page-shell subpage">
      <section className="page-intro opening-intro">
        <p className="eyebrow">A LITTLE MOMENT OF MYSTERY</p>
        <h1>Ready for a <span>surprise?</span></h1>
        <p>Watch fictional elemental abilities roll by, then see your ability details under the center marker.</p>
      </section>
      <DemoSpinner />
    </div>
  );
}
