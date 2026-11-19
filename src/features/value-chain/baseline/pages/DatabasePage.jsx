import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDownAZ,
  ArrowLeft,
  ArrowRight,
  ArrowUpAZ,
  BarChart3,
  Database,
  Download,
  Search,
  Table2,
} from 'lucide-react';
import DataPivotTable from '../components/DataPivotTable';
import { getTeaFarmerExport, getTeaFarmersForDatabase } from '../services/api';
import { downloadBlob } from '../utils/downloadCsv';

const PAGE_SIZE = 25;

export default function DatabasePage({
  allFarmers,
  district,
  loading,
  error,
  search,
  onSearchChange,
  schema,
}) {
  const [view, setView] = useState('table');
  const [sort, setSort] = useState({ column: 'RecordId', direction: 'asc' });
  const [page, setPage] = useState(0);
  const [columnSearch, setColumnSearch] = useState('');
  const [hiddenColumns, setHiddenColumns] = useState(() => new Set());
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const [databaseRecords, setDatabaseRecords] = useState([]);
  const [databaseLoading, setDatabaseLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getTeaFarmersForDatabase()
      .then(data => {
        if (!cancelled) setDatabaseRecords(data.features || []);
      })
      .catch(() => {
        if (!cancelled) setDatabaseError('Could not load the full database. Check the backend connection and try again.');
      })
      .finally(() => {
        if (!cancelled) setDatabaseLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const fieldsByKey = useMemo(
    () => new Map((schema?.fields || []).map(field => [field.key, field])),
    [schema],
  );

  const columns = useMemo(() => {
    if (schema?.fields?.length) {
      const fieldColumns = schema.fields.map(field => field.key);
      if (schema.recordIdField) return fieldColumns;
      return ['RecordId', ...(schema.createdAtColumn ? ['CreatedAt'] : []), ...fieldColumns];
    }
    return databaseRecords[0] ? Object.keys(databaseRecords[0]) : [];
  }, [databaseRecords, schema]);

  const pinnedColumns = useMemo(() => new Set([
    schema?.recordIdField || 'RecordId',
    schema?.mapFields?.nic,
    schema?.mapFields?.contact,
  ].filter(Boolean)), [schema]);

  const visibleColumns = useMemo(
    () => columns.filter(column => pinnedColumns.has(column) || !hiddenColumns.has(column)),
    [columns, hiddenColumns, pinnedColumns],
  );

  const filteredColumnChoices = useMemo(() => {
    const query = columnSearch.trim().toLocaleLowerCase();
    if (!query) return columns;
    return columns.filter(column => formatColumnName(column, fieldsByKey).toLocaleLowerCase().includes(query));
  }, [columnSearch, columns, fieldsByKey]);

  const matchingDatabaseRecords = useMemo(() => databaseRecords.filter(record => {
    const districtKey = schema?.mapFields?.district;
    const recordDistrict = record[districtKey] ?? record.district ?? record.District;
    const matchesDistrict = district === 'All' || recordDistrict === district;
    const searchableText = Object.values(record)
      .filter(value => value !== null && value !== undefined)
      .join(' ').toLocaleLowerCase();
    return matchesDistrict && searchableText.includes(search.toLocaleLowerCase());
  }), [databaseRecords, district, schema, search]);

  const sortedFarmers = useMemo(() => {
    const direction = sort.direction === 'asc' ? 1 : -1;
    return [...matchingDatabaseRecords].sort((left, right) => {
      const leftValue = left[sort.column];
      const rightValue = right[sort.column];
      if (leftValue == null && rightValue == null) return 0;
      if (leftValue == null) return 1;
      if (rightValue == null) return -1;

      const leftNumber = Number(leftValue);
      const rightNumber = Number(rightValue);
      if (String(leftValue).trim() !== '' && String(rightValue).trim() !== '' &&
          Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
        return (leftNumber - rightNumber) * direction;
      }
      return String(leftValue).localeCompare(String(rightValue), undefined, {
        numeric: true,
        sensitivity: 'base',
      }) * direction;
    });
  }, [matchingDatabaseRecords, sort]);

  useEffect(() => setPage(0), [district, search, sort]);

  useEffect(() => {
    if (!columns.includes(sort.column)) {
      setSort({ column: schema?.recordIdField || 'RecordId', direction: 'asc' });
    }
  }, [columns, schema, sort.column]);

  const totalPages = Math.max(1, Math.ceil(sortedFarmers.length / PAGE_SIZE));
  const pageRows = sortedFarmers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const firstVisibleRecord = sortedFarmers.length ? page * PAGE_SIZE + 1 : 0;
  const lastVisibleRecord = Math.min((page + 1) * PAGE_SIZE, sortedFarmers.length);
  const idColumn = schema?.recordIdField || 'RecordId';
  const pivotFields = columns.filter(column =>
    column !== 'RecordId' && column !== 'CreatedAt' && column !== schema?.recordIdField
  );

  const toggleSort = column => {
    setSort(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const toggleColumn = column => {
    if (pinnedColumns.has(column)) return;
    setHiddenColumns(current => {
      const next = new Set(current);
      if (next.has(column)) next.delete(column);
      else next.add(column);
      return next;
    });
  };

  const downloadEntireDatabase = async () => {
    setExporting(true);
    setExportError('');
    try {
      const { blob, filename } = await getTeaFarmerExport();
      downloadBlob(blob, filename);
    } catch (downloadError) {
      setExportError(downloadError.response?.data?.message || 'Could not download the database. Check the backend connection and try again.');
    } finally {
      setExporting(false);
    }
  };

  const activeError = databaseError || error;

  return (
    <>
      <section className="table-card spreadsheet-card">
        <div className="table-toolbar spreadsheet-toolbar">
          <div>
            <h2>Survey records</h2>
            <p>
              {databaseLoading
                ? 'Loading records…'
                : matchingDatabaseRecords.length.toLocaleString() + ' shown · ' +
                  databaseRecords.length.toLocaleString() + ' total · ' +
                  (schema?.fields?.length ?? Math.max(columns.length - 2, 0)) + ' survey fields'}
            </p>
          </div>
          <div className="database-toolbar-actions">
            <div className="search-field table-search">
              <Search size={17} />
              <input
                value={search}
                onChange={event => onSearchChange(event.target.value)}
                placeholder="Search any field"
                aria-label="Search all database fields"
              />
              {search && <button onClick={() => onSearchChange('')} aria-label="Clear search">×</button>}
            </div>
            <details className="column-picker">
              <summary>Columns ({visibleColumns.length})</summary>
              <div className="column-picker-panel">
                <div className="search-field">
                  <Search size={15} />
                  <input
                    value={columnSearch}
                    onChange={event => setColumnSearch(event.target.value)}
                    placeholder="Find a field"
                    aria-label="Find a database column"
                  />
                </div>
                <div className="column-picker-actions">
                  <button type="button" onClick={() => setHiddenColumns(new Set())}>Show all</button>
                  <button
                    type="button"
                    onClick={() => setHiddenColumns(new Set(columns.filter(column => !pinnedColumns.has(column))))}
                  >
                    Pinned fields only
                  </button>
                </div>
                <div className="column-picker-list">
                  {filteredColumnChoices.map(column => (
                    <label key={column}>
                      <input
                        type="checkbox"
                        checked={pinnedColumns.has(column) || !hiddenColumns.has(column)}
                        disabled={pinnedColumns.has(column)}
                        onChange={() => toggleColumn(column)}
                      />
                      <span>{formatColumnName(column, fieldsByKey)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </details>
            <button className="button-secondary download-button" onClick={downloadEntireDatabase} disabled={exporting || loading || allFarmers.length === 0}>
              <Download size={15} /> {exporting ? 'Preparing download…' : 'Download full database'}
            </button>
          </div>
        </div>

        {exportError && <div className="export-error" role="alert">{exportError}</div>}

        {activeError ? (
          <div className="empty-state"><AlertCircle size={24} /><p>{activeError}</p></div>
        ) : (
          <>
            <div className="database-view-tabs" role="tablist" aria-label="Database views">
              <button className={view === 'table' ? 'active' : ''} onClick={() => setView('table')} role="tab" aria-selected={view === 'table'}>
                <Table2 size={15} /> Data table
              </button>
              <button className={view === 'pivot' ? 'active' : ''} onClick={() => setView('pivot')} role="tab" aria-selected={view === 'pivot'}>
                <BarChart3 size={15} /> Pivot analysis
              </button>
            </div>

            {view === 'pivot' ? (
              databaseLoading && databaseRecords.length === 0
                ? <div className="empty-state"><Database size={24} /><p>Loading database records…</p></div>
                : <DataPivotTable records={matchingDatabaseRecords} fields={pivotFields} schema={schema} />
            ) : databaseLoading && columns.length === 0 ? (
              <div className="empty-state"><Database size={24} /><p>Loading database records…</p></div>
            ) : matchingDatabaseRecords.length === 0 ? (
              <div className="empty-state"><Database size={24} /><p>No records match your search.</p></div>
            ) : (
              <>
                <div className="spreadsheet-scroll" role="region" aria-label="Database records table" tabIndex="0">
                  <table className="spreadsheet-table">
                    <thead>
                      <tr>
                        {visibleColumns.map(column => (
                          <th key={column} className={column === idColumn ? 'sticky-first-column' : ''}>
                            <button className="column-sort" onClick={() => toggleSort(column)} title={'Sort by ' + formatColumnName(column, fieldsByKey)}>
                              <span>{formatColumnName(column, fieldsByKey)}</span>
                              {sort.column === column
                                ? sort.direction === 'asc' ? <ArrowUpAZ size={14} /> : <ArrowDownAZ size={14} />
                                : <span className="sort-placeholder">↕</span>}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map(farmer => (
                        <tr key={farmer.RecordId}>
                          {visibleColumns.map(column => (
                            <td key={column} className={column === idColumn ? 'sticky-first-column record-id' : ''} title={formatCell(farmer[column])}>
                              {formatCell(farmer[column])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="spreadsheet-footer">
                  <span>Rows {firstVisibleRecord}–{lastVisibleRecord} of {sortedFarmers.length.toLocaleString()}</span>
                  <span>NIC and telephone fields stay visible in the table and full download.</span>
                  <div className="database-pagination">
                    <button className="button-secondary" onClick={() => setPage(current => Math.max(0, current - 1))} disabled={page === 0} aria-label="Previous database page">
                      <ArrowLeft size={15} /> Previous
                    </button>
                    <span>Page {page + 1} of {totalPages}</span>
                    <button className="button-secondary" onClick={() => setPage(current => Math.min(totalPages - 1, current + 1))} disabled={page + 1 >= totalPages} aria-label="Next database page">
                      Next <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </>
  );
}

function formatColumnName(column, fieldsByKey) {
  if (column === 'RecordId') return 'Record ID';
  if (column === 'CreatedAt') return 'Added to database';
  const field = fieldsByKey.get(column);
  return field?.displayLabel || field?.label || column.replaceAll('_', ' ').replace(/\s+/g, ' ').trim();
}

function formatCell(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}
