export default function PageHeading({ icon: Icon, eyebrow, title, description, action }) {
  return (
    <section className="page-heading">
      <div>
        <div className="eyebrow"><Icon size={14} /> {eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </section>
  );
}