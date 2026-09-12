import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const COLORES = {
  fondoPrincipal: '#F8FAFC',    // Blanco Claro
  fondoTarjeta:   '#FFFFFF',    // Blanco Puro
  acentoPrincipal:'#2563EB',    // Azul Eléctrico
  acentoSecundario:'#3B82F6',   // Azul Vivo Secundario
  textoPrincipal: '#0F172A',    // Azul Noche Profundo
  textoSecundario:'#475569',    // Gris Pizarra
  bordeSuave:     '#E2E8F0'     // Borde neutro
};

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
  const [mostrarModalLocal, setMostrarModalLocal] = useState(false);

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

  const seleccinarFechaYIrAFormulario = (fechaId) => {
    setFormData((prev) => ({ ...prev, fecha_id: fechaId }));
    scrollToSection('reservar');
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

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    border: `1px solid ${COLORES.bordeSuave}`,
    backgroundColor: '#FFFFFF',
    color: COLORES.textoPrincipal,
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '600',
    color: COLORES.textoPrincipal
  };

  const fechaSeleccionadaObj = fechas.find((f) => f.id === parseInt(formData.fecha_id));

  return (
    <div style={{ backgroundColor: COLORES.fondoPrincipal, color: COLORES.textoPrincipal, minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. NAVBAR SUPERIOR CON MENÚ PARA LOCALES */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: '#FFFFFFEE', 
        backdropFilter: 'blur(10px)', 
        borderBottom: `1px solid ${COLORES.bordeSuave}`, 
        padding: '12px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)'
      }}>
        <div 
          onClick={() => scrollToSection('inicio')} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <img 
            src="/logo.jpg" 
            alt="Cuerdas Locales Logo" 
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
          />
          <span style={{ fontWeight: '800', fontSize: '20px', color: COLORES.textoPrincipal }}>
            Cuerdas <span style={{ color: COLORES.acentoPrincipal }}>Locales</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px', fontWeight: '600' }}>
          <button onClick={() => scrollToSection('inicio')} style={{ background: 'none', border: 'none', color: COLORES.textoSecundario, cursor: 'pointer' }}>Inicio</button>
          <button onClick={() => scrollToSection('fechas')} style={{ background: 'none', border: 'none', color: COLORES.textoSecundario, cursor: 'pointer' }}>Próximas Fechas</button>
          <button onClick={() => scrollToSection('faq')} style={{ background: 'none', border: 'none', color: COLORES.textoSecundario, cursor: 'pointer' }}>FAQ</button>
          
          {/* Opción destacada para Dueños de Restaurantes */}
          <button 
            onClick={() => setMostrarModalLocal(true)} 
            style={{ 
              backgroundColor: `${COLORES.acentoPrincipal}10`, 
              color: COLORES.acentoPrincipal, 
              border: `1px solid ${COLORES.acentoPrincipal}40`, 
              padding: '8px 14px', 
              borderRadius: '8px', 
              fontWeight: '700', 
              cursor: 'pointer' 
            }}
          >
            🍽️ ¿Tienes un Restaurante?
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION / INVITACIÓN CÁLIDA A CANTANTES */}
      <section id="inicio" style={{ padding: '80px 20px 40px 20px', textAlign: 'center', maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ display: 'inline-block', backgroundColor: `${COLORES.acentoPrincipal}15`, color: COLORES.acentoPrincipal, padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>
          🎙️ Sesiones Acústicas Itinerantes
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: '900', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-1px' }}>
          Trae la fogata de tu casa al escenario. <br />
          <span style={{ color: COLORES.acentoPrincipal }}>Canta, toca y comparte entre amigos.</span>
        </h1>
        <p style={{ fontSize: '18px', color: COLORES.textoSecundario, lineHeight: '1.6', marginBottom: '32px', maxWidth: '700px', margin: '0 auto 32px auto' }}>
          ¿Siempre has querido cantar en un escenario pero sin la presión de un concierto formal? En <strong>Cuerdas Locales</strong> preparamos el ambiente, ponemos los instrumentos (guitarra, bajo, teclado y micrófonos) y te asignamos un bloque de 15 minutos para que disfrutes con tus seres queridos en los mejores restaurantes de la ciudad.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button
            onClick={() => scrollToSection('fechas')}
            style={{
              backgroundColor: COLORES.acentoPrincipal,
              color: '#FFFFFF',
              padding: '16px 36px',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)'
            }}
          >
            Ver Próximas Fechas & Reservar 🎤
          </button>
        </div>
      </section>

      {/* 3. BLOQUE DE PRÓXIMAS FECHAS DISPONIBLES */}
      <section id="fechas" style={{ padding: '40px 20px 60px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>Próximas Fechas Disponibles</h2>
          <p style={{ color: COLORES.textoSecundario, fontSize: '15px' }}>Elige tu noche preferida y asegura tu lugar en el escenario.</p>
        </div>

        {cargandoFechas ? (
          <p style={{ textAlign: 'center', color: COLORES.textoSecundario }}>Cargando calendario de eventos...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {fechas.map((f) => {
              const disponibles = f.cupos_disponibles;
              const agotado = disponibles <= 0;
              return (
                <div 
                  key={f.id} 
                  style={{ 
                    backgroundColor: COLORES.fondoTarjeta, 
                    padding: '24px', 
                    borderRadius: '16px', 
                    border: `1px solid ${COLORES.bordeSuave}`, 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: COLORES.acentoPrincipal, backgroundColor: `${COLORES.acentoPrincipal}15`, padding: '4px 10px', borderRadius: '12px' }}>
                        {f.hora}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: agotado ? '#EF4444' : '#10B981' }}>
                        {agotado ? 'AGOTADO' : `${disponibles} cupos libres`}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', margin: '0 0 6px 0' }}>{f.fecha}</h3>
                    <p style={{ fontSize: '14px', color: COLORES.textoSecundario, margin: '0 0 16px 0' }}>📍 {f.lugar}</p>
                  </div>
                  <button
                    disabled={agotado}
                    onClick={() => seleccinarFechaYIrAFormulario(f.id)}
                    style={{
                      backgroundColor: agotado ? '#E2E8F0' : COLORES.acentoPrincipal,
                      color: agotado ? '#94A3B8' : '#FFFFFF',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      cursor: agotado ? 'not-allowed' : 'pointer',
                      width: '100%'
                    }}
                  >
                    {agotado ? 'Sin cupos' : 'Reservar esta fecha'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. FORMULARIO DE RESERVAS COMPLETO */}
      <section id="reservar" style={{ padding: '60px 20px', backgroundColor: COLORES.fondoPrincipal }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: COLORES.fondoTarjeta, padding: '36px', borderRadius: '24px', border: `1px solid ${COLORES.bordeSuave}`, boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', textAlign: 'center' }}>
            Inscripción de Participantes
          </h2>
          <p style={{ color: COLORES.textoSecundario, fontSize: '14px', textAlign: 'center', marginBottom: '28px' }}>
            Completa tus datos para confirmar tu turno en el micrófono.
          </p>

          {enviado ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: '#10B981', fontSize: '24px', margin: '0 0 12px 0', fontWeight: '800' }}>¡Reserva Confirmada!</h3>
              <p style={{ color: COLORES.textoSecundario, fontSize: '15px', lineHeight: '1.5', margin: '0 0 24px 0' }}>
                Tu turno ha sido guardado exitosamente. Te esperamos en el restaurante seleccionado.
              </p>
              <button
                onClick={reiniciarFormulario}
                style={{
                  backgroundColor: COLORES.acentoPrincipal,
                  color: '#FFFFFF',
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '10px',
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
                  <option value="">-- Selecciona una fecha --</option>
                  {fechas.map((f) => {
                    const disponibles = f.cupos_disponibles;
                    return (
                      <option key={f.id} value={f.id} disabled={disponibles <= 0}>
                        {f.fecha} a las {f.hora} | {f.lugar} ({disponibles > 0 ? `${disponibles} cupos libres` : 'AGOTADO'})
                      </option>
                    );
                  })}
                </select>
                {fechaSeleccionadaObj && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', backgroundColor: `${COLORES.acentoSecundario}10`, borderRadius: '10px', border: `1px solid ${COLORES.acentoSecundario}30`, fontSize: '13px', color: COLORES.acentoPrincipal }}>
                    📍 <strong>Lugar del evento:</strong> {fechaSeleccionadaObj.lugar}
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Instrumentos / Equipos a utilizar *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#F1F5F9', padding: '14px', borderRadius: '10px', border: `1px solid ${COLORES.bordeSuave}` }}>
                  {OPCIONES_INSTRUMENTOS.map((inst) => {
                    const check = formData.instrumentos.includes(inst);
                    return (
                      <label key={inst} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: check ? COLORES.textoPrincipal : COLORES.textoSecundario, fontWeight: check ? '600' : '400' }}>
                        <input
                          type="checkbox"
                          checked={check}
                          onChange={() => handleInstrumentoChange(inst)}
                          style={{ accentColor: COLORES.acentoPrincipal, width: '16px', height: '16px', cursor: 'pointer' }}
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
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '12px', borderRadius: '10px', fontSize: '14px' }}>
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando}
                style={{
                  backgroundColor: COLORES.acentoPrincipal,
                  color: '#FFFFFF',
                  padding: '14px',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '16px',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  marginTop: '10px'
                }}
              >
                {enviando ? 'Guardando reserva...' : 'Confirmar Mi Reserva'}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 5. SECCIÓN FAQ (PREGUNTAS FRECUENTES) */}
      <section id="faq" style={{ padding: '80px 20px', backgroundColor: COLORES.fondoPrincipal }}>
        <div style={{ maxWidth: '750px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', textAlign: 'center', marginBottom: '12px' }}>
            Preguntas Frecuentes
          </h2>
          <p style={{ color: COLORES.textoSecundario, fontSize: '16px', textAlign: 'center', marginBottom: '40px' }}>
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
                    backgroundColor: COLORES.fondoTarjeta,
                    borderRadius: '16px',
                    border: `1px solid ${COLORES.bordeSuave}`,
                    padding: '20px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '700', fontSize: '16px', color: isOpen ? COLORES.acentoPrincipal : COLORES.textoPrincipal }}>
                    <span>{faq.q}</span>
                    <span style={{ fontSize: '20px', color: COLORES.acentoPrincipal }}>{isOpen ? '−' : '+'}</span>
                  </div>
                  {isOpen && (
                    <p style={{ marginTop: '12px', color: COLORES.textoSecundario, fontSize: '14px', lineHeight: '1.6', margin: '12px 0 0 0' }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. MODAL PARA DUEÑOS DE RESTAURANTES */}
      {mostrarModalLocal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '36px',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
          }}>
            <button 
              onClick={() => setMostrarModalLocal(false)}
              style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', color: COLORES.textoSecundario }}
            >
              ✕
            </button>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🍽️</div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0' }}>Lleva Cuerdas Locales a tu Restaurante</h3>
            <p style={{ color: COLORES.textoSecundario, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Atrae mesas llenas en tus días de menor flujo. Nos encargamos de todo el equipamiento técnico, instrumentos, sonido y la gestión de inscripciones.
            </p>
            <a
              href="https://wa.me/56912345678?text=Hola,%20tengo%20un%20restaurante%20y%20me%20gustaria%20llevar%20Cuerdas%20Locales"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                textAlign: 'center',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: '800',
                textDecoration: 'none',
                fontSize: '15px'
              }}
            >
              Hablar con Producción por WhatsApp 📲
            </a>
          </div>
        </div>
      )}

      {/* 7. FOOTER */}
      <footer style={{ borderTop: `1px solid ${COLORES.bordeSuave}`, padding: '32px 20px', textAlign: 'center', color: COLORES.textoSecundario, fontSize: '14px', backgroundColor: '#FFFFFF' }}>
        <p style={{ margin: 0 }}>© {new Date().getFullYear()} Cuerdas Locales — Sesiones Acústicas Itinerantes.</p>
      </footer>

    </div>
  );
}