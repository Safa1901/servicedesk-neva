import { useState } from 'react';
import { fetchDocuments } from '../api/docs';

function LoaderCircle() {
  return (
    <svg
      className="loader-spinner"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="status"
      aria-label="Loading"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function DownloadIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

function FileTextIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function AlertCircleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

const DATABASES = [
  { value: 'buh3', label: 'Бухгалтерия 3' },
  { value: 'vse_ip', label: 'Все ИП' },
];

function getDefaultDateFrom() {
  const now = new Date();
  return `${now.getFullYear()}-01-01`;
}

function getDefaultDateTo() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

export default function DocumentsPage() {
  const [database, setDatabase] = useState('buh3');
  const [accountsText, setAccountsText] = useState('');
  const [dateFrom, setDateFrom] = useState(getDefaultDateFrom);
  const [dateTo, setDateTo] = useState(getDefaultDateTo);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const accounts = accountsText
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (accounts.length === 0) {
      newErrors.accounts = 'Введите хотя бы один лицевой счёт';
    }
    if (!dateFrom) {
      newErrors.dateFrom = 'Укажите дату начала';
    }
    if (!dateTo) {
      newErrors.dateTo = 'Укажите дату окончания';
    }
    if (dateFrom && dateTo && dateFrom > dateTo) {
      newErrors.dateTo = 'Дата окончания должна быть позже даты начала';
    }

    setErrors(newErrors);
    return { accounts, hasErrors: Object.keys(newErrors).length > 0 };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setDocuments(null);

    const { accounts, hasErrors } = validate();
    if (hasErrors) return;

    setLoading(true);
    try {
      const result = await fetchDocuments({
        database,
        accounts,
        dateFrom,
        dateTo,
      });

      if (result.success === false) {
        const msgs = Array.isArray(result.message) ? result.message : [result.message];
        throw new Error(msgs.join(', '));
      }

      setDocuments(result.data || {});
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке документов');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = (base64, filename) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleViewPdf = (base64) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const totalDocs = documents
    ? Object.values(documents).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  const totalWithPdf = documents
    ? Object.values(documents).reduce(
        (sum, arr) => sum + arr.filter((d) => d.pdf_base64 && !d.error).length,
        0
      )
    : 0;

  const totalErrors = documents
    ? Object.values(documents).reduce(
        (sum, arr) => sum + arr.filter((d) => d.error).length,
        0
      )
    : 0;

  return (
    <>
      <header className="top-bar">
        <div className="top-bar-left">
          <h2 className="page-title">Документы</h2>
        </div>
      </header>

      <div className="docs-page">
        <form className="docs-filter-form" onSubmit={handleSubmit}>
          <div className="docs-filter-row">
            <div className="form-group docs-field-db">
              <label className="form-label" htmlFor="database">База данных</label>
              <select
                id="database"
                className="form-input form-select"
                value={database}
                onChange={(e) => setDatabase(e.target.value)}
              >
                {DATABASES.map((db) => (
                  <option key={db.value} value={db.value}>{db.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group docs-field-date">
              <label className="form-label" htmlFor="dateFrom">Дата с</label>
              <input
                id="dateFrom"
                type="date"
                className={`form-input ${errors.dateFrom ? 'form-input-error' : ''}`}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              {errors.dateFrom && <p className="form-error-text">{errors.dateFrom}</p>}
            </div>

            <div className="form-group docs-field-date">
              <label className="form-label" htmlFor="dateTo">Дата по</label>
              <input
                id="dateTo"
                type="date"
                className={`form-input ${errors.dateTo ? 'form-input-error' : ''}`}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              {errors.dateTo && <p className="form-error-text">{errors.dateTo}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="accounts">
              Лицевые счета <span className="form-hint">(через запятую или с новой строки)</span>
            </label>
            <textarea
              id="accounts"
              className={`form-input form-textarea ${errors.accounts ? 'form-input-error' : ''}`}
              rows={3}
              placeholder={'ЛС001, ЛС002\nили\nЛС001\nЛС002'}
              value={accountsText}
              onChange={(e) => setAccountsText(e.target.value)}
            />
            {errors.accounts && <p className="form-error-text">{errors.accounts}</p>}
          </div>

          <div className="docs-filter-actions">
            <button className="btn-primary btn-sm" type="submit" disabled={loading}>
              {loading && <LoaderCircle />}
              Загрузить документы
            </button>
          </div>
        </form>

        {error && (
          <div className="docs-error-banner">
            <AlertCircleIcon className="icon-sm" />
            <span>{error}</span>
          </div>
        )}

        {documents && !loading && (
          <>
            <div className="docs-stats">
              <span className="docs-stat">Всего документов: <strong>{totalDocs}</strong></span>
              <span className="docs-stat docs-stat-ok">С PDF: <strong>{totalWithPdf}</strong></span>
              {totalErrors > 0 && (
                <span className="docs-stat docs-stat-err">С ошибками: <strong>{totalErrors}</strong></span>
              )}
            </div>

            {Object.keys(documents).length === 0 ? (
              <div className="empty-state">Документы не найдены</div>
            ) : (
              Object.entries(documents).map(([account, docs]) => (
                <div key={account} className="docs-account-section">
                  <h3 className="docs-account-title">{account}</h3>
                  <div className="table-wrapper">
                    <table className="tickets-table">
                      <thead>
                        <tr>
                          <th>Тип документа</th>
                          <th>Номер</th>
                          <th>Дата</th>
                          <th>Печатная форма</th>
                          <th style={{ width: '120px' }}>PDF</th>
                          <th>Ошибка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docs.map((doc, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="docs-doc-type">{doc.doc_type}</span>
                            </td>
                            <td className="ticket-id">{doc.doc_number}</td>
                            <td className="ticket-date">{doc.doc_date}</td>
                            <td>{doc.print_form}</td>
                            <td>
                              {doc.pdf_base64 && !doc.error ? (
                                <div className="docs-pdf-actions">
                                  <button
                                    className="docs-pdf-btn docs-pdf-btn-view"
                                    title="Открыть PDF"
                                    onClick={() => handleViewPdf(doc.pdf_base64)}
                                  >
                                    <FileTextIcon className="icon-xs" />
                                  </button>
                                  <button
                                    className="docs-pdf-btn docs-pdf-btn-download"
                                    title="Скачать PDF"
                                    onClick={() =>
                                      handleDownloadPdf(
                                        doc.pdf_base64,
                                        `${doc.print_form}_${doc.doc_number}.pdf`
                                      )
                                    }
                                  >
                                    <DownloadIcon className="icon-xs" />
                                  </button>
                                </div>
                              ) : (
                                <span className="docs-no-pdf">Нет</span>
                              )}
                            </td>
                            <td>
                              {doc.error ? (
                                <span className="docs-error-text">{doc.error}</span>
                              ) : (
                                <span className="docs-ok-text">OK</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {!documents && !loading && !error && (
          <div className="docs-empty-hint">
            <FileTextIcon className="docs-empty-icon" />
            <p>Выберите базу данных, укажите лицевые счета и период, затем нажмите &laquo;Загрузить документы&raquo;</p>
          </div>
        )}
      </div>
    </>
  );
}
