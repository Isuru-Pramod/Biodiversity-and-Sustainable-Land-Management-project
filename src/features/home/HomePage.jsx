import { useState } from 'react';
import { ArrowDown, ArrowRight, ChevronDown } from 'lucide-react';
import { categories } from '../../app/categories';

export default function HomePage({ onSelectSubcategory }) {
  const [openCategory, setOpenCategory] = useState(null);

  const toggleCategory = categoryId => {
    setOpenCategory(current => current === categoryId ? null : categoryId);
  };

  return (
    <div className="home-page ">
      <header className="home-header" aria-label="Project and partner logos">
        <div className="home-header-art" aria-hidden="true">
          <img src="/Logo_1.png" alt="" />
        </div>
        <div className="home-brand">
          <img src="/Logo_4.png" alt="Project title in Sinhala" />
        </div>
        <div className="home-partner-logos">
          <img src="/Logo_2.png" alt="Project partner organizations" />
        </div>
      </header>

      <section className="home-banner" aria-labelledby="project-title">
        <img
          className="home-banner-image"
          src="/Background_Banner.png"
          alt="A Sri Lankan wet-zone landscape with a kingfisher, elephant, forest, waterfalls, and a GIS map"
        />
        <div className="home-banner-shade" />
        <div className="home-banner-content">
          <span className="home-banner-kicker">SRI LANKA · BIODIVERSITY · SUSTAINABLE LAND MANAGEMENT</span>
          <h1 id="project-title">
            Partnerships and Innovative Financing to Mainstream Biodiversity and Sustainable Land Management in the Wet Climatic Zone of Sri Lanka
          </h1>
          <p>Explore the programmes, field data, and project workspaces supporting a more sustainable wet zone.</p>
          <a className="home-banner-button" href="#category-heading">
            Explore project areas <ArrowDown size={16} />
          </a>
        </div>
        <div className="home-banner-location"><span /> Wet Climatic Zone of Sri Lanka</div>
      </section>

      <main className="home-main">
        <section className="category-section" aria-labelledby="category-heading">
          <div className="category-section-heading">
            <div>
              <span className="home-eyebrow">PROJECT WORKSPACES</span>
              <h2 id="category-heading">Choose a category</h2>
            </div>
            <span className="category-count">{categories.length} workspaces</span>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const isOpen = openCategory === category.id;
              return (
                <article className={`category-card ${isOpen ? 'expanded' : ''}`} key={category.id} style={{ '--card-order': index }}>
                  <button
                    className="category-trigger"
                    onClick={() => toggleCategory(category.id)}
                    aria-expanded={isOpen}
                    aria-controls={`submenu-${category.id}`}
                  >
                    <span className={`category-icon category-icon-${category.id}`}><Icon size={22} strokeWidth={1.8} /></span>
                    <span className="category-copy"><strong>{category.name}</strong><small>{category.description}</small></span>
                    <ChevronDown className={`category-chevron ${isOpen ? 'rotated' : ''}`} size={18} />
                  </button>
                  {isOpen && (
                    <div className="subcategory-menu" id={`submenu-${category.id}`}>
                      <span className="subcategory-label">SUBCATEGORIES</span>
                      {category.subcategories.map(subcategory => (
                        <button
                          className="subcategory-link"
                          key={subcategory}
                          onClick={() => onSelectSubcategory(category, subcategory)}
                        >
                          <span>{subcategory}</span><ArrowRight size={15} />
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <footer className="home-footer">
          <span> Biodiversity GIS <span className="footer-separator">/</span> Project portal</span>
          <span>Additional categories and subcategories can be added here.</span>
        </footer>
      </main>
    </div>
  );
}
