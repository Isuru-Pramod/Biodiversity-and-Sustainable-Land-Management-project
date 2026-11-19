import { useEffect, useMemo, useState } from 'react';
import BaselineHeader from './components/BaselineHeader';
import MapPage from './pages/MapPage';
import DatabasePage from './pages/DatabasePage';
import QuestionnairePage from './pages/QuestionnairePage';
import { getHealth, getTeaFarmerSchema, getTeaFarmersForMap } from './services/api';

export default function BaselineWorkspace({ onBack }) {
  const [farmers, setFarmers] = useState([]);
  const [health, setHealth] = useState(null);
  const [schema, setSchema] = useState(null);
  const [district, setDistrict] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState('map');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [healthData, mapData, schemaData] = await Promise.all([
        getHealth(),
        getTeaFarmersForMap(),
        getTeaFarmerSchema(),
      ]);
      setHealth(healthData);
      setFarmers(mapData.features || []);
      setSchema(schemaData);
    } catch (err) {
      console.error(err);
      setError('We couldn’t load the GIS records. Check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all([getHealth(), getTeaFarmersForMap(), getTeaFarmerSchema()])
      .then(([healthData, mapData, schemaData]) => {
        if (cancelled) return;
        setHealth(healthData);
        setFarmers(mapData.features || []);
        setSchema(schemaData);
      })
      .catch(err => {
        if (cancelled) return;
        console.error(err);
        setError('We couldn’t load the GIS records. Check that the backend is running.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const districts = useMemo(() => [
    'All',
    ...new Set(farmers.map(farmer => farmer.district).filter(Boolean)),
  ].sort((a, b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)), [farmers]);

  const filteredFarmers = useMemo(() => farmers.filter(farmer => {
    const farmerDistrict = farmer.district ?? farmer.District;
    const matchesDistrict = district === 'All' || farmerDistrict === district;
    const searchableText = Object.values(farmer)
      .filter(value => value !== null && value !== undefined)
      .join(' ').toLowerCase();
    return matchesDistrict && searchableText.includes(search.toLowerCase());
  }), [farmers, district, search]);

  return (
    <div className="app-shell min-h-screen text-slate-800">
      <BaselineHeader activePage={page} onNavigate={setPage} onBack={onBack} isOnline={Boolean(health)} />

      <main className="page-content">
        {page === 'map' && (
          <MapPage
            farmers={farmers}
            visibleFarmers={filteredFarmers}
            districts={districts}
            district={district}
            onDistrictChange={setDistrict}
            search={search}
            onSearchChange={setSearch}
            loading={loading}
            error={error}
            onRefresh={loadData}
          />
        )}
        {page === 'database' && (
          <DatabasePage
            allFarmers={farmers}
            district={district}
            loading={loading}
            error={error}
            search={search}
            onSearchChange={setSearch}
            schema={schema}
          />
        )}
        {page === 'questionnaire' && <QuestionnairePage schema={schema} onSaved={loadData} />}
      </main>
    </div>
  );
}
