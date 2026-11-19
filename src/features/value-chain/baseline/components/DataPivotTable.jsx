import { useEffect, useMemo, useState } from 'react';
import { Calculator, ChartNoAxesCombined, Download } from 'lucide-react';
import { downloadCsv, downloadDateStamp } from '../utils/downloadCsv';

const RECORD_COUNT = '__record_count__';

export default function DataPivotTable({ records, fields, schema }) {
  const [rowField, setRowField] = useState('');
  const [columnField, setColumnField] = useState('');
  const [valueField, setValueField] = useState(RECORD_COUNT);
  const [aggregation, setAggregation] = useState('count');

  useEffect(() => {
    const defaultRow = schema?.mapFields?.district || fields[0] || '';
    const defaultColumn = schema?.mapFields?.gender || fields.find(field => field !== defaultRow) || '';
    setRowField(defaultRow);
    setColumnField(defaultColumn);
    setValueField(RECORD_COUNT);
    setAggregation('count');
  }, [schema?.profile]);

  const fieldMetadata = useMemo(
    () => new Map((schema?.fields || []).map(field => [field.key, field])),
    [schema],
  );

  const numericFields = useMemo(() => fields.filter(field => {
    const protectedDimensions = [
      schema?.mapFields?.latitude,
      schema?.mapFields?.longitude,
      schema?.mapFields?.nic,
      schema?.mapFields?.contact,
      schema?.beneficiaryIdField,
      schema?.recordIdField,
    ];
    if (protectedDimensions.includes(field)) return false;
    if (fieldMetadata.has(field)) return fieldMetadata.get(field).numeric;
    const values = records
      .map(record => record[field])
      .filter(value => value !== null && value !== undefined && String(value).trim() !== '');
    return values.length > 0 && values.every(value => Number.isFinite(Number(value)));
  }), [fieldMetadata, fields, records, schema]);

  const pivotColumnOptions = useMemo(() => fields.filter(field => {
    if (field === rowField || field === schema?.recordIdField) return false;
    const distinctCount = new Set(records.map(record => normalizeValue(record[field]))).size;
    const identifiers = [schema?.mapFields?.nic, schema?.mapFields?.contact];
    return distinctCount >= 2 && (distinctCount <= 14 || identifiers.includes(field));
  }), [fields, records, rowField, schema]);

  const pivot = useMemo(
    () => buildPivot(records, rowField, columnField, valueField, aggregation),
    [records, rowField, columnField, valueField, aggregation],
  );

  const handleRowChange = event => {
    const next = event.target.value;
    setRowField(next);
    if (columnField === next) setColumnField('');
  };

  const handleValueChange = event => {
    setValueField(event.target.value);
    setAggregation(event.target.value === RECORD_COUNT ? 'count' : 'sum');
  };

  const downloadPivot = () => {
    const measure = describeValue(valueField, aggregation, fieldMetadata);
    const headers = [formatField(rowField, fieldMetadata), ...pivot.columns, 'Grand total'];
    const rows = pivot.rows.map(row => [
      row.label,
      ...pivot.columns.map(column => row.values.get(column) ?? 0),
      row.total,
    ]);
    rows.push([
      'Grand total',
      ...pivot.columns.map(column => pivot.columnTotals.get(column) ?? 0),
      pivot.grandTotal,
    ]);
    const filename = 'TeaGrow_pivot_' +
      formatField(rowField, fieldMetadata).replaceAll(' ', '_') +
      '_' + downloadDateStamp() + '.csv';
    downloadCsv(filename, headers.map((header, index) =>
      index === 0 ? header : header + ' (' + measure + ')'
    ), rows);
  };

  return (
    <div className="pivot-workspace">
      <section className="pivot-builder">
        <div className="pivot-builder-heading">
          <span className="pivot-builder-icon"><ChartNoAxesCombined size={18} /></span>
          <div>
            <h3>Build a pivot table</h3>
            <p>Baseline fields, including NIC and telephone, are available as dimensions.</p>
          </div>
        </div>

        <div className="pivot-controls">
          <PivotSelect label="Rows" value={rowField} onChange={handleRowChange} fields={fields} fieldMetadata={fieldMetadata} />
          <PivotSelect label="Columns" value={columnField} onChange={event => setColumnField(event.target.value)} fields={pivotColumnOptions} fieldMetadata={fieldMetadata} allowNone />
          <label className="pivot-control">
            <span>Values</span>
            <select value={valueField} onChange={handleValueChange}>
              <option value={RECORD_COUNT}>Record count</option>
              {numericFields.map(field => (
                <option key={field} value={field}>{formatField(field, fieldMetadata)}</option>
              ))}
            </select>
          </label>
          <label className="pivot-control">
            <span>Summarize by</span>
            <select value={aggregation} onChange={event => setAggregation(event.target.value)} disabled={valueField === RECORD_COUNT}>
              <option value="count">Count</option>
              <option value="sum">Sum</option>
              <option value="average">Average</option>
            </select>
          </label>
        </div>
      </section>

      <section className="pivot-result-card">
        <div className="pivot-result-header">
          <div>
            <h3><Calculator size={16} /> Pivot results</h3>
            <p>{pivot.rows.length} row groups · {records.length} source records</p>
            {pivot.columns.length > 25 && (
              <p className="pivot-warning">
                This field creates {pivot.columns.length} column groups. Consider placing it in Rows for a narrower table.
              </p>
            )}
          </div>
          <div className="pivot-result-actions">
            <span className="pivot-value-label">{describeValue(valueField, aggregation, fieldMetadata)}</span>
            <button className="button-secondary download-button" onClick={downloadPivot} disabled={pivot.rows.length === 0}>
              <Download size={14} /> Download pivot
            </button>
          </div>
        </div>
        {pivot.rows.length === 0 ? (
          <div className="empty-state"><Calculator size={24} /><p>No data is available for this pivot.</p></div>
        ) : (
          <div className="pivot-scroll">
            <table className="pivot-table">
              <thead>
                <tr>
                  <th>{formatField(rowField, fieldMetadata)}</th>
                  {pivot.columns.map(column => <th key={column}>{column}</th>)}
                  <th className="pivot-total">Grand total</th>
                </tr>
              </thead>
              <tbody>
                {pivot.rows.map(row => (
                  <tr key={row.key}>
                    <th scope="row">{row.label}</th>
                    {pivot.columns.map(column => <td key={column}>{formatNumber(row.values.get(column))}</td>)}
                    <td className="pivot-total">{formatNumber(row.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th>Grand total</th>
                  {pivot.columns.map(column => <td key={column}>{formatNumber(pivot.columnTotals.get(column))}</td>)}
                  <td className="pivot-total">{formatNumber(pivot.grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function PivotSelect({ label, value, onChange, fields, fieldMetadata, allowNone = false }) {
  return (
    <label className="pivot-control">
      <span>{label}</span>
      <select value={value} onChange={onChange}>
        {allowNone && <option value="">No column field</option>}
        {fields.map(field => (
          <option key={field} value={field}>{formatField(field, fieldMetadata)}</option>
        ))}
      </select>
    </label>
  );
}

function buildPivot(records, rowField, columnField, valueField, aggregation) {
  const columnValues = columnField
    ? [...new Set(records.map(record => normalizeValue(record[columnField])))].sort(compareLabels)
    : ['Total'];
  const groupedRows = new Map();
  const columnTotals = new Map(columnValues.map(column => [column, createAccumulator()]));
  const grandTotal = createAccumulator();

  records.forEach(record => {
    const rowLabel = normalizeValue(record[rowField]);
    const rowKey = rowLabel;
    const columnLabel = columnField ? normalizeValue(record[columnField]) : 'Total';
    if (!groupedRows.has(rowKey)) {
      groupedRows.set(rowKey, {
        key: rowKey,
        label: rowLabel,
        values: new Map(columnValues.map(column => [column, createAccumulator()])),
        total: createAccumulator(),
      });
    }

    const row = groupedRows.get(rowKey);
    const rawValue = valueField === RECORD_COUNT ? 1 : record[valueField];
    addToAccumulator(row.values.get(columnLabel), rawValue, valueField === RECORD_COUNT, aggregation);
    addToAccumulator(row.total, rawValue, valueField === RECORD_COUNT, aggregation);
    addToAccumulator(columnTotals.get(columnLabel), rawValue, valueField === RECORD_COUNT, aggregation);
    addToAccumulator(grandTotal, rawValue, valueField === RECORD_COUNT, aggregation);
  });

  const finalize = accumulator => {
    if (!accumulator || accumulator.count === 0) return 0;
    if (aggregation === 'average' && valueField !== RECORD_COUNT) return accumulator.sum / accumulator.count;
    if (aggregation === 'sum' && valueField !== RECORD_COUNT) return accumulator.sum;
    return accumulator.count;
  };

  return {
    columns: columnValues,
    rows: [...groupedRows.values()].sort((a, b) => compareLabels(a.label, b.label)).map(row => ({
      ...row,
      values: new Map([...row.values].map(([column, total]) => [column, finalize(total)])),
      total: finalize(row.total),
    })),
    columnTotals: new Map([...columnTotals].map(([column, total]) => [column, finalize(total)])),
    grandTotal: finalize(grandTotal),
  };
}

function createAccumulator() {
  return { count: 0, sum: 0 };
}

function addToAccumulator(accumulator, value, countRecords, aggregation) {
  if (!accumulator) return;
  if (countRecords) {
    accumulator.count += 1;
    accumulator.sum += 1;
    return;
  }
  if (value === null || value === undefined || String(value).trim() === '') return;
  const number = Number(value);
  if (!Number.isFinite(number)) return;
  accumulator.count += 1;
  if (aggregation === 'sum' || aggregation === 'average') accumulator.sum += number;
}

function normalizeValue(value) {
  return value === null || value === undefined || String(value).trim() === '' ? '(blank)' : String(value);
}

function compareLabels(left, right) {
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
}

function formatField(field, fieldMetadata) {
  return fieldMetadata.get(field)?.displayLabel || fieldMetadata.get(field)?.label ||
    field.replaceAll('_', ' ').replace(/\s+/g, ' ').trim();
}

function describeValue(valueField, aggregation, fieldMetadata) {
  if (valueField === RECORD_COUNT) return 'Count of records';
  const summary = aggregation === 'average' ? 'Average' : aggregation === 'sum' ? 'Sum' : 'Count';
  return summary + ' of ' + formatField(valueField, fieldMetadata);
}

function formatNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
}
