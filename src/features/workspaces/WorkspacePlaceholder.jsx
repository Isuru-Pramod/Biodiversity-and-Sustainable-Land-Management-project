import { ArrowLeft, Clock3 } from 'lucide-react';

export default function WorkspacePlaceholder({ category, subcategory, onBack }) {
  const Icon = category.icon;

  return (
    <div className="placeholder-page">
      <header className="placeholder-header">
        <button className="back-home-button" onClick={onBack}><ArrowLeft size={16} /> All categories</button>
        <div className="placeholder-breadcrumb">{category.name}<span>/</span>{subcategory}</div>
      </header>
      <main className="placeholder-main">
        <div className="placeholder-icon"><Icon size={27} /></div>
        <span className="home-eyebrow">WORKSPACE</span>
        <h1>{subcategory}</h1>
        <p>This workspace is part of <strong>{category.name}</strong>. Its pages and database will be added when this subcategory is developed.</p>
        <div className="placeholder-status"><Clock3 size={15} /> Planned for a future development phase</div>
        <button className="placeholder-return" onClick={onBack}><ArrowLeft size={15} /> Return to project categories</button>
      </main>
    </div>
  );
}
