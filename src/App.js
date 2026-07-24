import React, { useState } from 'react';

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    instrumento: 'Guitarra Acústica',
    fecha: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ backgroundColor: '#1A1A1A', color: '#F4EBD4', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', padding: '20px' }}>
      
      {/* HEADER / HERO SECTION */}
      <header style={{ textAlign: 'center', padding: '60px 20px 40px', borderBottom: '1px solid #E5A93C33' }}>
        <h1 style={{ color: '#E5A93C', fontSize: '3rem', margin: '0 0 10px 0', letterSpacing: '2px' }}>
          CUERDAS LOCALES
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#F4EBD4', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
          La experiencia Open Mic donde la música en vivo y la buena mesa se encuentran.
        </p>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main style={{ maxWidth: '800px', margin: '40px auto', display: 'grid', gap: '40px' }}>
        
        {/* SECCIÓN SOBRE LA EXPERIENCIA */}
        <section style={{ backgroundColor: '#242424', padding: '30px', borderRadius: '12px', border: '1px solid #E5A93C' }}>
          <h2 style={{ color: '#E5A93C', marginTop: 0 }}>¿Cómo funciona?</h2>
          <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Llegas al restaurante, pides tu mesa y te preparas para disfrutar.</li>
            <li>Ponemos a tu disposición instrumentos de primera calidad (guitarras, micrófonos y más).</li>
            <li>Inscríbete en el escenario y comparte tu música en un ambiente íntimo y acogedor.</li>
          </ul>
        </section>

        {/* FORMULARIO DE INSCRIPCIÓN */}
        <section style={{ backgroundColor: '#242424', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
          <h2 style={{ color: '#E5A93C', marginTop: 0, textAlign: 'center' }}>Reserva tu Turno en el Escenario</h2>
          
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#E5A93C' }}>
              <h3>¡Inscripción Recibida! 🎸</h3>
              <p style={{ color: '#F4EBD4' }}>Te enviamos la confirmación por correo electrónico. ¡Nos vemos pronto en Cuerdas Locales!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Nombre completo:</label>
                <input 
                  type="text" 
                  required 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1A1A1A', color: '#F4EBD4' }}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Correo electrónico:</label>
                  <input 
                    type="email" 
                    required 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1A1A1A', color: '#F4EBD4' }}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem' }}>Instrumento principal:</label>
                  <select 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#1A1A1A', color: '#F4EBD4' }}
                    onChange={(e) => setFormData({...formData, instrumento: e.target.value})}
                  >
                    <option>Guitarra Acústica</option>
                    <option>Voz / Canto</option>
                    <option>Teclado / Piano</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                style={{ 
                  marginTop: '10px', 
                  backgroundColor: '#E5A93C', 
                  color: '#1A1A1A', 
                  padding: '12px', 
                  border: 'none', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  fontSize: '1rem', 
                  cursor: 'pointer' 
                }}
              >
                Inscribirme
              </button>
            </form>
          )}
        </section>
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} Cuerdas Locales — Noches de Open Mic
      </footer>
    </div>
  );
}