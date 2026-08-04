import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const OPCIONES_INSTRUMENTOS = [
  'Guitarra acústica',
  'Bajo',
  'Piano',
  'Micrófono (Voz)'
];

export default function App() {
  const [fechas, setFechas] = useState([]);
  const [cargandoFechas, setCargandoFechas] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [enviado, setEnviado] = useState(false);

  // Estado del formulario con las nuevas variables
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

  // Manejador para los checkboxes de instrumentos
  const handleInstrumentoChange = (instrumento) => {
    setFormData((prev) => {
      const existe = prev.instrumentos.includes(instrumento);
      const nuevosInstrumentos = existe
        ? prev.instrumentos.filter((i) => i !== instrumento)
        : [...prev.instrumentos, instrumento];

      return { ...prev, instrumentos: nuevosInstrumentos };
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
      // 1. Guardar la inscripción
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
  
      // 2. Descontar 1 cupo en Supabase
      const nuevosCupos = fechaSeleccionada.cupos_disponibles - 1;
      const { error: errorUpdate } = await supabase
        .from('fechas_eventos')
        .update({ cupos_disponibles: nuevosCupos })
        .eq('id', fechaIdInt);
  
      if (errorUpdate) throw errorUpdate;
  
      // 3. Actualizar el estado local para que se refleje de inmediato en la pantalla
      setFechas((prevFechas) =>
        prevFechas.map((f) =>
          f.id === fechaIdInt ? { ...f, cupos_disponibles: nuevosCupos } : f
        )
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

  return (
    <div style={{ backgroundColor: '#1A1A1A', color: '#F4EBD4', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Cuerdas Locales 🎸</h1>
        <p>Reserva tu espacio para cantar y compartir en vivo</p>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#2A2A2A', padding: '30px', borderRadius: '8px' }}>
        {enviado ? (
          <div style={{ textAlign: 'center', color: '#4CAF50' }}>
            <h2>¡Reserva registrada con éxito! 🎉</h2>
            <p style={{ color: '#F4EBD4', marginTop: '15px' }}>
              Te esperamos. Hemos registrado tus instrumentos y número de acompañantes.
            </p>
            <button
              onClick={reiniciarFormulario}
              style={{
                marginTop: '25px',
                backgroundColor: '#F4EBD4',
                color: '#1A1A1A',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Realizar otra reserva
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* DATOS PERSONALES */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Nombre completo *:</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Email *:</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono / WhatsApp *:</label>
                <input
                  type="tel"
                  name="telefono"
                  required
                  value={formData.telefono}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
                />
              </div>
            </div>

            {/* SELECCIÓN DE FECHA */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Selecciona una fecha / evento *:</label>
              <select
  name="fecha_id"
  required
  value={formData.fecha_id}
  onChange={handleChange}
  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
>
  <option value="">-- Selecciona una fecha --</option>
  {cargandoFechas ? (
    <option disabled>Cargando fechas disponibles...</option>
  ) : (
    fechas.map((f) => {
      // Tomamos cupos_totales (si no existe o viene null, usamos 8 por defecto)
      const totales = f.cupos_totales || 8;
      const disponibles = f.cupos_disponibles;

      return (
        <option key={f.id} value={f.id} disabled={disponibles <= 0}>
          {f.fecha} a las {f.hora} - {f.lugar} ({disponibles > 0 ? `${disponibles} de ${totales} cupos disponibles` : 'AGOTADO'})
        </option>
      );
    })
  )}
</select>
            </div>

            {/* CHECKBOXES INSTRUMENTOS */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px' }}>
                Instrumentos o equipos que vas a utilizar (selecciona al menos uno) *:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#222', padding: '12px', borderRadius: '4px' }}>
                {OPCIONES_INSTRUMENTOS.map((inst) => (
                  <label key={inst} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.instrumentos.includes(inst)}
                      onChange={() => handleInstrumentoChange(inst)}
                    />
                    <span>{inst}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* NÚMERO DE ACOMPAÑANTES */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                ¿Cuántos acompañantes vendrán contigo? (Sin contarte a ti):
              </label>
              <input
                type="number"
                name="num_acompanantes"
                min="0"
                max="10"
                value={formData.num_acompanantes}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
              <small style={{ color: '#aaa', marginTop: '4px', display: 'block' }}>
                Esta información servirá para preparar las mesas en el restaurante.
              </small>
            </div>

            {/* CANCIONES */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Repertorio o canciones propuestas:</label>
              <textarea
                name="canciones"
                rows="2"
                placeholder="Ej: Te regalo - Carla Morrison, Flaca - Andrés Calamaro"
                value={formData.canciones}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
            </div>

            {/* MENSAJE A PRODUCCIÓN */}
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Mensaje o nota para el equipo de producción:</label>
              <textarea
                name="mensaje_produccion"
                rows="2"
                placeholder="Ej: Llego 15 min antes para probar sonido / Necesito conectar una pista por plug..."
                value={formData.mensaje_produccion}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
            </div>

            {errorMsg && <p style={{ color: '#FF5252', fontWeight: 'bold' }}>{errorMsg}</p>}

            <button
              type="submit"
              disabled={enviando}
              style={{
                backgroundColor: '#F4EBD4',
                color: '#1A1A1A',
                padding: '14px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '16px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                marginTop: '10px'
              }}
            >
              {enviando ? 'Guardando reserva...' : 'Confirmar Reserva'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}