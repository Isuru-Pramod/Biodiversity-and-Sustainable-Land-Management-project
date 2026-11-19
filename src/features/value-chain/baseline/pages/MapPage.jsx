import {
  AlertCircle,
  Layers,
  MapPin,
  Search,
} from 'lucide-react';
import MapView from '../components/MapView';

export default function MapPage({
  farmers,
  visibleFarmers,
  districts,
  district,
  onDistrictChange,
  search,
  onSearchChange,
  loading,
  error,
  onRefresh,
}) {
  return (
    <>

      <section className="workspace-card">
        <div className="map-panel">
          {loading && <div className="map-overlay"><span className="loading-spinner" />Loading farmer locations…</div>}
          {error && (
            <div className="map-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={onRefresh}>Try again</button>
            </div>
          )}
          {!loading && !error && <MapView farmers={visibleFarmers} />}
          {!loading && !error && (
            <div className="map-caption"><span className="legend-dot" /> Farmer locations <span className="caption-divider" /> {visibleFarmers.length} visible</div>
          )}
        </div>

        <aside className="control-panel">
          <div className="panel-heading">
            <span className="panel-icon"><Layers size={17} /></span>
            <div><h2>Map controls</h2><p>Refine the locations on the map</p></div>
          </div>

          <label className="field-label" htmlFor="map-search">Search records</label>
          <div className="search-field">
            <Search size={17} />
            <input
              id="map-search"
              value={search}
              onChange={event => onSearchChange(event.target.value)}
              placeholder="District, Gn or ID"
            />
            {search && <button onClick={() => onSearchChange('')} aria-label="Clear search">×</button>}
          </div>

          <label className="field-label" htmlFor="district-filter">District</label>
          <select id="district-filter" value={district} onChange={event => onDistrictChange(event.target.value)} className="select-field">
            {districts.map(item => <option key={item} value={item}>{item === 'All' ? 'All districts' : item}</option>)}
          </select>

          <div className="visible-summary ">
            <div><span>Showing on map</span><strong>{visibleFarmers.length}</strong></div>
            <span className="summary-total">of {farmers.length} records</span>
          </div>


        </aside>
      </section>

    </>
  );
}
