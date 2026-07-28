import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    instrumento: 'Guitarra Acústica',
    canciones: '',
    fecha_id: '',
  });

  const [fechas, setFechas] = useState<any[]>([]);
  const [cargandoFechas, setCargandoFechas] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Cargar las fechas/eventos disponibles desde Supabase al montar el componente
  useEffect(() => {
    async function obtenerFechas() {
      try {
        const { data, error } = await supabase
          .from('eventos') // Ajusta 'eventos' al nombre de tu tabla en Supabase si se llama 'fechas'
          .select('*');

        if (error) {
          console.error('Error al obtener fechas:', error);
        } else if (data && data.length > 0) {
          setFechas(data);
          setFormData((prev) => ({ ...prev, fecha_id: data[0].id }));
        }
      } catch (err) {
        console.error('Error de conexión con Supabase:', err);
      } finally {
        setCargandoFechas(false);
      }
    }

    obtenerFechas();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Insertar los datos de la inscripción en la base de datos de Supabase
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('inscripciones')
        .insert([
          {
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            instrumento: formData.instrumento,
            canciones: formData.canciones,
            fecha_id: formData.fecha_id || null,
          },
        ]);

      if (error) {
        throw error;
      }

      setEnviado(true);
    } catch (error: any) {
      console.error('Error al guardar inscripción:', error);
      setErrorMsg('Ocurrió un error al guardar tu inscripción. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#1A1A1A', color: '#F4EBD4', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
      
      {/* NAVEGACIÓN CON LOGO */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '1px solid #E5A93C33', backgroundColor: '#141414' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <img 
            src="/logo.jpg" 
            alt="Cuerdas Locales Logo" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          />
          <h1 style={{ color: '#E5A93C', margin: 0, fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>
            CUERDAS LOCALES
          </h1>
        </div>
        <a 
          href="#inscripcion" 
          style={{ backgroundColor: '#E5A93C', color: '#1A1A1A', padding: '0.6rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', textDecoration: 'none', transition: '0.2s' }}
        >
          Inscribirme
        </a>
      </nav>

      {/* HERO / INICIO */}
      <header style={{ 
        position: 'relative',
        backgroundImage: 'linear-gradient(rgba(26, 26, 26, 0.85), rgba(26, 26, 26, 0.95)), url("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        textAlign: 'center', 
        padding: '5rem 1.5rem 4rem', 
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ color: '#E5A93C', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Open Mic
          </p>
          <h2 style={{ fontSize: '2.8rem', color: '#F4EBD4', marginTop: 0, marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Toca en los mejores restaurantes usando nuestros instrumentos
          </h2>
          <p style={{ fontSize: '1.2rem', color: '#D1C7B7', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            Una experiencia única para músicos emergentes y aficionados. Nosotros ponemos el escenario, la amplificación y los instrumentos; tú pones el talento.
          </p>
          <a 
            href="#inscripcion" 
            style={{ display: 'inline-block', backgroundColor: '#E5A93C', color: '#1A1A1A', padding: '0.9rem 2.2rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', boxShadow: '0 4px 14px rgba(229, 169, 60, 0.3)' }}
          >
            Asegura tu Cupo
          </a>
        </div>
      </header>

      {/* CÓMO FUNCIONA */}
      <section style={{ backgroundColor: '#222222', padding: '4rem 1.5rem', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ color: '#E5A93C', fontSize: '2rem', marginBottom: '2.5rem' }}>¿Cómo funciona?</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: '#1A1A1A', borderRadius: '12px', border: '1px solid #E5A93C33', overflow: 'hidden', textAlign: 'left' }}>
              <img 
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80" 
                alt="Formulario de inscripción" 
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1.5rem' }}>
                <div style={{ color: '#E5A93C', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>1. Inscríbete</div>
                <p style={{ color: '#B5ACA0', fontSize: '0.95rem', margin: 0 }}>Rellena el formulario con tus datos y el horario en el que deseas participar.</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#1A1A1A', borderRadius: '12px', border: '1px solid #E5A93C33', overflow: 'hidden', textAlign: 'left' }}>
              <img 
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" 
                alt="Ambiente en restaurante" 
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1.5rem' }}>
                <div style={{ color: '#E5A93C', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>2. Llega al Local</div>
                <p style={{ color: '#B5ACA0', fontSize: '0.95rem', margin: 0 }}>Te esperamos en el restaurante con todo el equipamiento listo y afinado.</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#1A1A1A', borderRadius: '12px', border: '1px solid #E5A93C33', overflow: 'hidden', textAlign: 'left' }}>
              <img 
                src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=600&q=80" 
                alt="Músico tocando guitarra en vivo" 
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <div style={{ padding: '1.5rem' }}>
                <div style={{ color: '#E5A93C', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>3. Toca en Vivo</div>
                <p style={{ color: '#B5ACA0', fontSize: '0.95rem', margin: 0 }}>Sube al escenario, disfruta el ambiente y comparte tu música con el público.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO DE INSCRIPCIÓN */}
      <section id="inscripcion" style={{ padding: '4rem 1.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ color: '#E5A93C', textAlign: 'center', fontSize: '2rem', marginBottom: '0.5rem' }}>
          Formulario de Participación
        </h3>
        <p style={{ textAlign: 'center', color: '#B5ACA0', marginBottom: '2rem' }}>
          Reserva tu turno para la próxima fecha de Open Mic.
        </p>

        {enviado ? (
          <div style={{ backgroundColor: '#242424', padding: '2rem', borderRadius: '8px', border: '1px solid #E5A93C', textAlign: 'center' }}>
            <h4 style={{ color: '#E5A93C', margin: '0 0 0.5rem 0' }}>¡Inscripción Recibida!</h4>
            <p style={{ color: '#F4EBD4', margin: 0 }}>
              Gracias por registrarte, {formData.nombre}. Te contactaremos pronto para confirmar tu horario.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {errorMsg && (
              <div style={{ backgroundColor: '#721c24', color: '#f8d7da', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                {errorMsg}
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#F4EBD4', fontSize: '0.9rem' }}>Fecha de Evento</label>
              <select 
                name="fecha_id" 
                value={formData.fecha_id} 
                onChange={handleChange}
                disabled={cargandoFechas}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#242424', color: '#F4EBD4', boxSizing: 'border-box' }}
              >
                {cargandoFechas ? (
                  <option>Cargando fechas disponibles...</option>
                ) : fechas.length > 0 ? (
                  fechas.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.lugar ? `${f.fecha} - ${f.lugar}` : f.fecha}
                    </option>
                  ))
                ) : (
                  <option value="">Próxima fecha por confirmar</option>
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#F4EBD4', fontSize: '0.9rem' }}>Nombre Completo</label>
              <input 
                type="text" 
                name="nombre" 
                required 
                value={formData.nombre} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#242424', color: '#F4EBD4', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#F4EBD4', fontSize: '0.9rem' }}>Correo Electrónico</label>
              <input 
                type="email" 
                name="email" 
                required 
                value={formData.email} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#242424', color: '#F4EBD4', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#F4EBD4', fontSize: '0.9rem' }}>Teléfono / WhatsApp</label>
              <input 
                type="tel" 
                name="telefono" 
                required 
                value={formData.telefono} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#242424', color: '#F4EBD4', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#F4EBD4', fontSize: '0.9rem' }}>Instrumento Principal</label>
              <select 
                name="instrumento" 
                value={formData.instrumento} 
                onChange={handleChange}
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#242424', color: '#F4EBD4', boxSizing: 'border-box' }}
              >
                <option value="Guitarra Acústica">Guitarra Acústica</option>
                <option value="Guitarra Eléctrica">Guitarra Eléctrica</option>
                <option value="Canto / Voz">Canto / Voz</option>
                <option value="Bajo">Bajo</option>
                <option value="Teclado">Teclado</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', color: '#F4EBD4', fontSize: '0.9rem' }}>Canciones o repertorio breve (Opcional)</label>
              <textarea 
                name="canciones" 
                rows={3} 
                value={formData.canciones} 
                onChange={handleChange}
                placeholder="Ej: 2 canciones acústicas rock/pop"
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#242424', color: '#F4EBD4', boxSizing: 'border-box' }}
              />
            </div>
            <button 
              type="submit" 
              disabled={enviando}
              style={{ 
                backgroundColor: enviando ? '#888' : '#E5A93C', 
                color: '#1A1A1A', 
                padding: '0.9rem', 
                borderRadius: '6px', 
                border: 'none', 
                fontWeight: 'bold', 
                fontSize: '1rem', 
                cursor: enviando ? 'not-allowed' : 'pointer', 
                marginTop: '0.5rem' 
              }}
            >
              {enviando ? 'Guardando...' : 'Enviar Inscripción'}
            </button>
          </form>
        )}
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#121212', textAlign: 'center', padding: '2rem 1.5rem', borderTop: '1px solid #222', color: '#888', fontSize: '0.85rem' }}>
        <p style={{ margin: '0 0 0.5rem 0' }}>&copy; {new Date().getFullYear()} Cuerdas Locales. Todos los derechos reservados.</p>
        <p style={{ margin: 0, color: '#E5A93C' }}>Música en vivo & Experiencias gastronómicas</p>
      </footer>
    </div>
  );
}