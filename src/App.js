export default function App() {
  return (
    <div style={{ backgroundColor: '#1A1A1A', color: '#F4EBD4', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header / Navbar */}
      <header style={{ borderBottom: '1px solid #E5A93C', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#E5A93C', margin: 0, fontSize: '1.5rem', letterSpacing: '2px' }}>CUERDAS LOCALES</h1>
        <button style={{ backgroundColor: '#E5A93C', color: '#1A1A1A', border: 'none', padding: '0.6rem 1.2rem', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }}>
          Inscribirse
        </button>
      </header>

      {/* Hero Section */}
      <main style={{ padding: '4rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', color: '#F4EBD4', marginBottom: '1rem' }}>
          La música en vivo la pones <span style={{ color: '#E5A93C' }}>tú</span>
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#D1D1D1', lineHeight: '1.6' }}>
          Llegamos al restaurante con instrumentos listos para sonar. El escenario y el micrófono son tuyos.
        </p>
      </main>
    </div>
  );
}