import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const OPCIONES_INSTRUMENTOS = [
  'Guitarra acústica',
  'Bajo',
  'Piano',
  'Micrófono (Voz)'
];

const PREGUNTAS_FRECUENTES = [
  {
    q: '¿Tengo que llevar mi propio instrumento?',
    a: 'Disponemos de amplificación y micrófonos básicos en el escenario. Si tocas guitarra, bajo o teclado, te recomendamos llevar tu instrumento, aunque en varias fechas contamos con instrumentos de apoyo.'
  },
  {
    q: '¿Cuánto dura la presentación de cada participante?',
    a: 'Cada cupo reservado cuenta con un bloque de aprox. 15 a 20 minutos (2 a 3 canciones) para asegurar que todos los inscritos puedan subir al escenario.'
  },
  {
    q: '¿Puedo asistir solo como espectador sin cantar?',
    a: '¡Por supuesto! La entrada para espectadores es libre (sujeta al consumo en el restaurante socio). Puedes venir a apoyar a tus amigos o a disfrutar del talento local.'
  },
  {
    q: '¿Tiene algún costo inscribirse para cantar?',
    a: 'La participación en Cuerdas Locales es completamente gratuita para los músicos inscritos. Solo debes reservar tu cupo con anticipación.'
  },
  {
    q: '¿Cómo sé en qué restaurante me toca?',
    a: 'Al seleccionar la fecha en el formulario, se especifica el restaurante o venue correspondiente. Además, te enviaremos la confirmación con la dirección exacta.'
  }
];

export default function App() {
  const [fechas, setFechas] = useState([]);
  const [cargandoFechas, setCargandoFechas] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [faqAbierto, setFaqAbierto] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha_id: '',
    instrumentos: [],
    num_acompanantes: 0,
    canciones: '',
    mensaje_produccion: ''
  });

  useEffect(() => {
    async function obtenerFechas() {
      try {
        setCargandoFechas(true);
        const { data, error } = await supabase
          .from('fechas_eventos')
          .select('*')
          .eq('activo', true);

        if (error) throw error;
        if (data) setFechas(data);
      } catch (error) {
        console.error('Error al cargar fechas:', error);
        setErrorMsg('Error al cargar las fechas disponibles.');
      } finally {
        setCargandoFechas(false);
      }
    }

    obtenerFechas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleInstrumentoChange = (instrumento) => {
    setFormData((prev) => {
      const existe = prev.instrumentos.includes(instrumento);
      const nuevos = existe
        ? prev.instrumentos.filter((i) => i !== instrumento)
        : [...prev.instrumentos, instrumento];
      return { ...prev, instrumentos: nuevos };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErrorMsg('');

    if (formData.instrumentos.length === 0) {
      setErrorMsg('Por favor selecciona al menos un instrumento o micrófono.');
      setEnviando(false);
      return;
    }

    const fechaIdInt = parseInt(formData.fecha_id);
    const fechaSeleccionada = fechas.find((f) => f.id === fechaIdInt);

    if (!fechaSeleccionada || fechaSeleccionada.cupos_disponibles <= 0) {
      setErrorMsg('Lo sentimos, esta fecha ya no tiene cupos disponibles.');
      setEnviando(false);
      return;
    }

    try {
      const { error: errorInscripcion } = await supabase
        .from('inscripciones')
        .insert([
          {
            fecha_id: fechaIdInt,
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            instrumento: formData.instrumentos.join(', '),
            instrumentos: formData.instrumentos,
            num_acompanantes: parseInt(formData.num_acompanantes),
            canciones: formData.canciones,
            mensaje_produccion: formData.mensaje_produccion
          }
        ]);

      if (errorInscripcion) throw errorInscripcion;

      const nuevosCupos = fechaSeleccionada.cupos_disponibles - 1;
      const { error: errorUpdate } = await supabase
        .from('fechas_eventos')
        .update({ cupos_disponibles: nuevosCupos })
        .eq('id', fechaIdInt);

      if (errorUpdate) throw errorUpdate;

      setFechas((prev) =>
        prev.map((f) => (f.id === fechaIdInt ? { ...f, cupos_disponibles: nuevosCupos } : f))
      );

      setEnviado(true);
    } catch (error) {
      console.error('Error al guardar reserva:', error);
      setErrorMsg('Ocurrió un error: ' + (error.message || 'Intenta nuevamente.'));
    } finally {
      setEnviando(false);
    }
  };

  const reiniciarFormulario = () => {
    setEnviado(false);
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      fecha_id: '',
      instrumentos: [],
      num_acompanantes: 0,
      canciones: '',
      mensaje_produccion: ''
    });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Estilos en línea reutilizables
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#CBD5E1'
  };

  // Fecha seleccionada actualmente en el formulario
  const fechaSeleccionadaObj = fechas.find((f) => f.id === parseInt(formData.fecha_id));

  return (
    <div style={{ backgroundColor: '#0F172A', color: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. NAVBAR SUPERIOR */}
      {/* NAVBAR SUPERIOR */}
<nav style={{ 
  position: 'sticky', 
  top: 0, 
  zIndex: 100, 
  backgroundColor: '#0F172ACC', 
  backdropFilter: 'blur(10px)', 
  borderBottom: '1px solid #334155', 
  padding: '12px 24px', 
  display: 'flex', 
  justify: 'space-between', 
  alignItems: 'center' 
}}>
  {/* Branding / Logo */}
  <div 
    onClick={() => scrollToSection('inicio')} 
    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
  >
    <img 
      src="/logo.jpg" 
      alt="Cuerdas Locales Logo" 
      style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
    />
    <span style={{ fontWeight: '800', fontSize: '20px', color: '#F59E0B' }}>
      Cuerdas Locales
    </span>
  </div>

  {/* Menú de Navegación */}
  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
    <button onClick={() => scrollToSection('inicio')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}>Inicio</button>
    <button onClick={() => scrollToSection('reservar')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}>Reservar</button>
    <button onClick={() => scrollToSection('locales')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}>Locales</button>
    <button onClick={() => scrollToSection('faq')} style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}>FAQ</button>
  </div>
</nav>

      {/* 2. HERO SECTION */}
      <section id="inicio" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', backgroundColor: '#F59E0B20', color: '#F59E0B', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '16px' }}>
          Música en Vivo & Jam Sessions
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '900', lineHeight: '1.1', marginBottom: '20px', letterSpacing: '-1px' }}>
          Tu voz y tu guitarra tienen lugar en el escenario.
        </h1>
        <p style={{ fontSize: '18px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '32px', maxWidth: '650px', margin: '0 auto 32px auto' }}>
          Cuerdas Locales lleva la música acústica en vivo a distintos restaurantes y bares cada mes. Reserva tu espacio de tiempo, invita a tus amigos y comparte lo que más te apasiona.
        </p>
        <button
          onClick={() => scrollToSection('reservar')}
          style={{
            backgroundColor: '#F59E0B',
            color: '#0F172A',
            padding: '16px 36px',
            border: 'none',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245, 158, 11, 0.3)'
          }}
        >
          Reservar Mi Cupo Ahora 🎙️
        </button>
      </section>

      {/* 3. FORMULARIO DE RESERVAS */}
      <section id="reservar" style={{ padding: '60px 20px', backgroundColor: '#0B1120' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#1E293B', padding: '36px', borderRadius: '20px', border: '1px solid #334155', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', textAlign: 'center' }}>
            Inscripción de Músicos
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '14px', textAlign: 'center', marginBottom: '28px' }}>
            Selecciona la fecha, el local socio y asegura tu bloque de presentación.
          </p>

          {enviado ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: '#10B981', fontSize: '24px', margin: '0 0 12px 0' }}>¡Reserva Confirmada!</h3>
              <p style={{ color: '#94A3B8', fontSize: '15px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                Tu cupo ha sido guardado exitosamente. Te esperamos en la fecha y local seleccionados.
              </p>
              <button
                onClick={reiniciarFormulario}
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#0F172A',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Hacer otra reserva
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={labelStyle}>Nombre completo *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej. Camila Silva"
                  value={formData.nombre}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Correo electrónico *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="camila@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>WhatsApp / Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    placeholder="+56 9 1234 5678"
                    value={formData.telefono}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Selecciona Fecha & Local Socio *</label>
                <select
                  name="fecha_id"
                  required
                  value={formData.fecha_id}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">-- Selecciona una sesión disponible --</option>
                  {cargandoFechas ? (
                    <option disabled>Cargando sesiones...</option>
                  ) : (
                    fechas.map((f) => {
                      const totales = f.cupos_totales || 8;
                      const disponibles = f.cupos_disponibles;
                      return (
                        <option key={f.id} value={f.id} disabled={disponibles <= 0}>
                          {f.fecha} a las {f.hora} | {f.lugar} ({disponibles > 0 ? `${disponibles} de ${totales} cupos disponibles` : 'AGOTADO'})
                        </option>
                      );
                    })
                  )}
                </select>
                {fechaSeleccionadaObj && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: '#0F172A', borderRadius: '8px', border: '1px solid #334155', fontSize: '13px', color: '#F59E0B' }}>
                    📍 <strong>Lugar del evento:</strong> {fechaSeleccionadaObj.lugar}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Instrumentos / Equipos a utilizar *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#0F172A', padding: '14px', borderRadius: '8px', border: '1px solid #334155' }}>
                  {OPCIONES_INSTRUMENTOS.map((inst) => {
                    const check = formData.instrumentos.includes(inst);
                    return (
                      <label key={inst} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: check ? '#F8FAFC' : '#94A3B8' }}>
                        <input
                          type="checkbox"
                          checked={check}
                          onChange={() => handleInstrumentoChange(inst)}
                          style={{ accentColor: '#F59E0B', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <span>{inst}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>¿Cuántos acompañantes vendrán a verte?</label>
                <input
                  type="number"
                  name="num_acompanantes"
                  min="0"
                  max="10"
                  value={formData.num_acompanantes}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Canciones que te gustaría interpretar (Opcional)</label>
                <textarea
                  name="canciones"
                  rows="2"
                  placeholder="Ej. Rayando el sol, Persiana Americana..."
                  value={formData.canciones}
                  onChange={handleChange}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Mensaje para la producción (Opcional)</label>
                <textarea
                  name="mensaje_produccion"
                  rows="2"
                  placeholder="Ej. Requiero prueba de sonido antes / Llego a las 20:30."
                  value={formData.mensaje_produccion}
                  onChange={handleChange}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {errorMsg && (
                <div style={{ backgroundColor: '#EF444415', border: '1px solid #EF4444', color: '#F87171', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                style={{
                  backgroundColor: '#F59E0B',
                  color: '#0F172A',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                  marginTop: '10px'
                }}
              >
                {enviando ? 'Guardando reserva...' : 'Confirmar Mi Reserva'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 4. SECCIÓN MODALIDAD ITINERANTE & LOCALES SOCIOS */}
      <section id="locales" style={{ padding: '80px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px' }}>
            Un escenario itinerante 📍
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Cuerdas Locales no tiene un local fijo. Nos aliamoss con los mejores restaurantes, bares y espacios culturales de la ciudad para crear experiencias únicas en cada edición.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🍽️</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Gastronomía & Coctelería</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Cada local socio ofrece su carta para que tus acompañantes disfruten de una excelente cena mientras escuchan música en vivo.</p>
          </div>

          <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔊</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Sonido Profesional</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Llevamos y preparamos el equipo acústico necesario para que te escuches increíble sin complicaciones técnicas.</p>
          </div>

          <div style={{ backgroundColor: '#1E293B', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🤝</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Comunidad Musicial</h3>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>Conoce a otros músicos de la zona, conecta para futuros proyectos y comparte el escenario en un ambiente cercano y amigable.</p>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN FAQ */}
      <section id="faq" style={{ padding: '80px 20px', backgroundColor: '#0B1120' }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '12px' }}>
            Preguntas Frecuentes
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '16px', textAlign: 'center', marginBottom: '40px' }}>
            Todo lo que necesitas saber antes de subir al escenario.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {PREGUNTAS_FRECUENTES.map((faq, idx) => {
              const isOpen = faqAbierto === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setFaqAbierto(isOpen ? null : idx)}
                  style={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '16px', color: isOpen ? '#F59E0B' : '#F8FAFC' }}>
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '20px' }}>{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && (
                    <p style={{ marginTop: '12px', color: '#94A3B8', fontSize: '14px', lineHeight: '1.6', margin: '12px 0 0 0' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer style={{ borderTop: '1px solid #334155', padding: '32px 20px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Cuerdas Locales — Sesiones Acústicas Itinerantes.</p>
      </footer>

    </div>
  );
}