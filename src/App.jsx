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
    instrumento: 'Voz', // Valor por defecto
    fecha_id: '',
    canciones: ''
  });

  useEffect(() => {
    async function obtenerFechas() {
      try {
        setCargandoFechas(true);
        // Consulta exacta a tu tabla fechas_eventos
        const { data, error } = await supabase
          .from('fechas_eventos')
          .select('*')
          .eq('activo', true);

        if (error) {
          console.error('Error Supabase:', error);
          setErrorMsg('Error al conectar con la base de datos: ' + error.message);
          throw error;
        }

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
      // Inserción exacta en tu tabla inscripciones
      const { data, error } = await supabase
        .from('inscripciones')
        .insert([
          {
            nombre: formData.nombre,
            email: formData.email,
            telefono: formData.telefono,
            fecha_id: parseInt(formData.fecha_id),
            instrumento: formData.instrumento,
            canciones: formData.canciones
          }
        ]);

      if (error) throw error;
      setEnviado(true);
    } catch (error) {
      console.error('Error al guardar inscripción:', error);
      setErrorMsg('Ocurrió un error al guardar tu reserva: ' + (error.message || 'Intenta nuevamente.'));
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
              <label style={{ display: 'block', marginBottom: '5px' }}>¿Qué vas a cantar / tocar?:</label>
              <input
                type="text"
                name="instrumento"
                required
                placeholder="Ej: Voz, Guitarra y Voz..."
                value={formData.instrumento}
                onChange={handleChange}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#333', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Selecciona una fecha / evento:</label>
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
                  fechas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.fecha} a las {f.hora} - {f.lugar} ({f.cupos_disponibles} cupos)
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Canciones que te gustaría cantar:</label>
              <textarea
                name="canciones"
                rows="3"
                value={formData.canciones}
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