import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardList, LoaderCircle, Search, ShieldCheck } from 'lucide-react';
import PageHeading from '../components/PageHeading';
import { createTeaFarmer } from '../services/api';

function createEmptyForm(fields) {
  return Object.fromEntries(fields.map(field => [field.key, '']));
}

function groupByQuestion(fields) {
  const groups = new Map();
  fields.forEach(field => {
    const groupKey = field.questionCode || 'additional';
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        title: field.questionCode
          ? 'Question ' + field.questionCode.toUpperCase() + (field.questionTitle ? ': ' + field.questionTitle : '')
          : 'Additional fields',
        fields: [],
      });
    }
    groups.get(groupKey).fields.push(field);
  });
  return [...groups.values()];
}

export default function QuestionnairePage({ schema, onSaved }) {
  const inputFields = useMemo(
    () => schema?.fields?.filter(field => field.input) || [],
    [schema],
  );
  const emptyForm = useMemo(() => createEmptyForm(inputFields), [inputFields]);
  const [form, setForm] = useState({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setForm(emptyForm);
  }, [emptyForm]);

  const answeredCount = inputFields.filter(field =>
    form[field.key] !== undefined && String(form[field.key]).trim() !== ''
  ).length;

  const visibleSections = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return (schema?.sections || []).map(section => {
      const fields = inputFields.filter(field => field.sectionId === section.id);
      const matchingFields = query
        ? fields.filter(field =>
            field.displayLabel.toLocaleLowerCase().includes(query) ||
            field.label.toLocaleLowerCase().includes(query) ||
            (field.questionTitle || '').toLocaleLowerCase().includes(query)
          )
        : fields;
      return { ...section, questionGroups: groupByQuestion(matchingFields) };
    }).filter(section => section.questionGroups.length > 0);
  }, [inputFields, schema, search]);

  const updateField = (name, value) => {
    setForm(current => ({ ...current, [name]: value }));
    if (message) setMessage(null);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const result = await createTeaFarmer({ answers: form });
      setMessage({
        type: 'success',
        text: result.message + ' Record ID: ' + result.recordId,
      });
      setForm(emptyForm);
      onSaved?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Could not save this response. Check the connection and try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (!schema) {
    return (
      <>
        <PageHeading icon={ClipboardList} title="farmer questionnaire" />
        <div className="empty-state"><LoaderCircle className="spin" size={24} /><p>Loading the baseline question catalog…</p></div>
      </>
    );
  }

  return (
    <>
      <PageHeading icon={ClipboardList} title="farmer questionnaire" />

      <section className="questionnaire-intro">
        <div>
          <h2>Tea small-holder baseline</h2>
          <p>Use the searchable question sections to enter a complete baseline record. The database assigns the record ID after saving.</p>
        </div>
        <div className="questionnaire-progress" aria-live="polite">
          <strong>{answeredCount} / {inputFields.length}</strong>
          <span>fields completed</span>
        </div>
      </section>

      {message && (
        <div className={'form-message ' + message.type} role="status">
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      <form className="questionnaire-form actual-questionnaire" onSubmit={handleSubmit}>
        <div className="questionnaire-search">
          <Search size={17} />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Find a question or field"
            aria-label="Find a questionnaire field"
          />
          {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear field search">×</button>}
        </div>

        <div className="questionnaire-section-list">
          {visibleSections.map(section => (
            <details className="form-section actual-form-section" key={section.id} open={Boolean(search)}>
              <summary className="form-section-heading">
                <span className="section-number">{String(section.id).startsWith('questions-') ? section.id.replace('questions-', '').replace('-', '–') : '•'}</span>
                <div><h2>{section.title}</h2><p>{section.questionGroups.reduce((total, group) => total + group.fields.length, 0)} fields</p></div>
              </summary>
              <div className="questionnaire-question-groups">
                {section.questionGroups.map(group => (
                  <details className="questionnaire-question" key={group.key} open={Boolean(search)}>
                    <summary>{group.title}<span>{group.fields.length}</span></summary>
                    <div className="form-grid">
                      {group.fields.map(field => (
                        <FormField
                          key={field.key}
                          field={field}
                          value={form[field.key] ?? ''}
                          onChange={value => updateField(field.key, value)}
                        />
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          ))}
        </div>

        <div className="form-footer">
          <div className="privacy-note">
            <ShieldCheck size={17} />
            <span>NIC, telephone and photo-reference fields are part of this survey form.</span>
          </div>
          <div className="form-actions">
            <button type="button" className="button-secondary" onClick={() => { setForm(emptyForm); setMessage(null); }}>Clear form</button>
            <button type="submit" className="button-primary" disabled={saving || inputFields.length === 0}>
              {saving ? <LoaderCircle className="spin" size={16} /> : <CheckCircle2 size={16} />}
              {saving ? 'Saving response…' : 'Save questionnaire'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

function FormField({ field, value, onChange }) {
  const id = 'field-' + field.key;
  const className = 'form-control ' + (field.sensitive ? 'sensitive-field' : '');
  const commonProps = {
    id,
    name: field.key,
    value,
    required: Boolean(field.required),
    onChange: event => onChange(event.target.value),
    placeholder: field.placeholder || '',
    className,
    autoComplete: field.sensitive ? 'off' : undefined,
  };

  if (field.type === 'checkbox') {
    return (
      <div className="form-field checkbox-field">
        <label htmlFor={id}>
          <input
            id={id}
            name={field.key}
            type="checkbox"
            checked={Boolean(value) && !['0', 'false', 'no'].includes(String(value).toLowerCase())}
            onChange={event => onChange(event.target.checked ? '1' : '')}
          />
          <span>{field.displayLabel}</span>
          {field.sensitive && <span className="sensitive-mark">Sensitive</span>}
        </label>
      </div>
    );
  }

  return (
    <div className={'form-field ' + (field.type === 'textarea' ? 'wide-field' : '')}>
      <label htmlFor={id}>
        {field.displayLabel}
        {field.required ? <span className="required-mark"> *</span> : <span className="optional-mark"> (optional)</span>}
        {field.sensitive && <span className="sensitive-mark">Sensitive</span>}
      </label>
      {field.type === 'textarea' ? (
        <textarea {...commonProps} rows="3" />
      ) : field.type === 'select' ? (
        <select {...commonProps}>
          <option value="">Select an answer</option>
          {field.options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : (
        <input {...commonProps} type={field.type || 'text'} step={field.type === 'number' ? 'any' : undefined} />
      )}
    </div>
  );
}
