export default function DashboardPage() {
  return (
    <>
      <header className="top-bar">
        <div className="top-bar-left">
          <h2 className="page-title">Dashboard</h2>
        </div>
      </header>
      <div style={{ padding: '1.5rem' }}>
        <div className="grid-auto-rows-min gap-4 md:grid-cols-3" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          <div className="stat-card">
            <div className="stat-label">Всего заявок</div>
            <div className="stat-value">6</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">В работе</div>
            <div className="stat-value">2</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">НовыеПР</div>
            <div className="stat-value">2</div>
          </div>
        </div>
      </div>
    </>
  );
}
