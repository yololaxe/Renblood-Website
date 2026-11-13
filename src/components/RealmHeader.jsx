import "./realm.css";

export default function RealmHeader({ eyebrow, title, description, children }) {
  const label = eyebrow?.split("/").at(-1)?.trim() || title;
  return <header className="realm-header realm-header--compact">
    <div className="realm-heading realm-heading--compact">
      <div><h1>{label}</h1>{description && <p className="sr-only">{description}</p>}</div>
      {children && <div className="realm-header-actions">{children}</div>}
    </div>
  </header>;
}
