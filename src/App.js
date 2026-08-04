import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [fechas, setFechas] = useState([]);
  const [cargandoFechas, setCargandoFechas] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [enviado, setEnviado] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha_id: '',
    mensaje: ''
  });

  useEffect(() => {
    async function obtenerFechas() {
      try {
        setCargandoFechas(true);
        // Ajusta 'fechas_disponibles' según el nombre real de tu tabla en Supabase
        const { data, error } = await supabase
          .from('fechas_disponibles')
          .select('*');

        if (error) throw error;
        if (data) setFechas(data);
      } catch (error) {
        console.error('Error al cargar fechas:', error);
      } finally {
        setCargandoFechas(false);
      }
    }

    obtenerFechas();
  }, []);

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErrorMsg('');

    try {
      // Ajusta 'reservas' según el nombre real de tu tabla en Supabase
      const { data, error } = await supabase
        .from('reservas')
        .insert([
          {
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            fecha_id: formData.fecha_id,
            mensaje: formData.mensaje
          }
        ]);

      if (error) throw error;
      setEnviado(true);
    } catch (error) {
      console.error('Error al guardar inscripción:', error);
      setErrorMsg('Ocurrió un error al guardar tu inscripción. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#1A1A1A', color: '#F4EBD4', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Cuerdas Locales</h1>
        <p>Reserva tu espacio para cantar con nosotros</p>
      </header>

      <main style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#2A2A2A', padding: '30px', borderRadius: '8px' }}>
        {enviado ? (
          <div style={{ textAlign: 'center', color: '#4CAF50' }}>
            <h2>¡Reserva registrada con éxito! 🎉</h2>
            <p>Te enviaremos los detalles a tu correo electrónico.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Nombre completo:</label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Correo electrónico:</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Teléfono / WhatsApp:</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Selecciona una fecha:</label>
              <select
                name="fecha_id"
                required
                value={formData.fecha_id}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              >
                <option value="">-- Selecciona un horario --</option>
                {cargandoFechas ? (
                  <option disabled>Cargando fechas...</option>
                ) : (
                  fechas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fecha || f.descripcion || f.nombre || `Sesión ${f.id}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Comentarios o canción propuesta:</label>
              <textarea
                name="mensaje"
                rows="3"
                value={formData.mensaje}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
            </div>

            {errorMsg && <p style={{ color: '#FF5252' }}>{errorMsg}</p>}

            <button
              type="submit"
              disabled={enviando}
              style={{
                backgroundColor: '#F4EBD4',
                color: '#1A1A1A',
                padding: '12px',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: enviando ? 'not-allowed' : 'pointer',
                marginTop: '10px'
              }}
            >
              {enviando ? 'Enviando reserva...' : 'Confirmar Reserva'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}