export default function StatCard({ title, value, icon: Icon, tone = 'green' }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${tone}`}><Icon size={19} /></span>
      <div>
        <p>{title}</p>
        <strong>{Number(value).toLocaleString()}</strong>
      </div>
    </div>
  );
}
