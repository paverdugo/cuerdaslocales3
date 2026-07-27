import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [fechas, setFechas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    instrumento: 'Guitarra Acústica',
    canciones: ''
  });
  const [cargando, setCargando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Cargar fechas disponibles al montar el componente
  useEffect(() => {
    obtenerFechas();
  }, []);

  async function obtenerFechas() {
    const { data, error } = await supabase
      .from('fechas_eventos')
      .select('*')
      .eq('activo', true)
      .gt('cupos_disponibles', 0)
      .order('fecha', { ascending: true });

    if (!error && data) {
      setFechas(data);
      if (data.length > 0) setFechaSeleccionada(data[0].id);
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);

    // 1. Guardar la inscripción
    const { error: errorInscripcion } = await supabase
      .from('inscripciones')
      .insert([
        {
          fecha_id: fechaSeleccionada,
          nombre: formData.nombre,
          email: formData.email,
          telefono: formData.telefono,
          instrumento: formData.instrumento,
          canciones: formData.canciones
        }
      ]);

    if (errorInscripcion) {
      alert('Ocurrió un error al registrar tu inscripción.');
      setCargando(false);
      return;
    }

    // 2. Descontar cupo en la fecha
    const fechaObj = fechas.find((f) => f.id === parseInt(fechaSeleccionada));
    if (fechaObj) {
      await supabase
        .from('fechas_eventos')
        .update({ cupos_disponibles: fechaObj.cupos_disponibles - 1 })
        .eq('id', fechaSeleccionada);
    }

    setCargando(false);
    setEnviado(true);
    obtenerFechas(); // Recargar fechas
  };

  return (
    <div style={{ backgroundColor: '#1A1A1A', color: '#F4EBD4', minHeight: '100vh', padding: '2rem' }}>
      <h1>CUERDAS LOCALES - Inscripción</h1>

      {enviado ? (
        <div style={{ color: '#E5A93C' }}>
          <h2>¡Inscripción confirmada!</h2>
          <p>Te hemos reservado un cupo. Nos vemos pronto en el escenario.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <label>Selecciona una fecha:</label>
          <select 
            value={fechaSeleccionada} 
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px' }}
          >
            {fechas.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fecha} ({item.hora}) - Quedan {item.cupos_disponibles} cupos
              </option>
            ))}
          </select>

          <input type="text" name="nombre" placeholder="Nombre completo" required onChange={handleChange} style={{ padding: '0.5rem' }} />
          <input type="email" name="email" placeholder="Correo electrónico" required onChange={handleChange} style={{ padding: '0.5rem' }} />
          <input type="tel" name="telefono" placeholder="Teléfono / WhatsApp" onChange={handleChange} style={{ padding: '0.5rem' }} />

          <select name="instrumento" onChange={handleChange} style={{ padding: '0.5rem' }}>
            <option>Guitarra Acústica</option>
            <option>Bajo</option>
            <option>Teclado</option>
            <option>Voz Principal</option>
            <option>Percusión / Cajón</option>
          </select>

          <textarea name="canciones" placeholder="Canciones que te gustaría tocar" onChange={handleChange} style={{ padding: '0.5rem' }} />

          <button 
            type="submit" 
            disabled={cargando || fechas.length === 0}
            style={{ backgroundColor: '#E5A93C', color: '#1A1A1A', padding: '0.8rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            {cargando ? 'Guardando...' : 'Confirmar Inscripción'}
          </button>
        </form>
      )}
    </div>
  );
}
