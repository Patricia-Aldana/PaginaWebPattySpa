import React from "react";
import "./Profesionales.css";

// Imágenes de los profesionales (asegúrate de tenerlas en assets/img)
import diana from "../assets/img/diana.png";
import patricia from "../assets/img/patricia.png";
import juliana from "../assets/img/juliana.png";
import karen from "../assets/img/karen.png";

function Profesionales() {
  const profesionales = [
    {
      nombre: "Diana Escobar",
      especialidad: "Manicura y Pedicura",
      experiencia: "5 años de experiencia embelleciendo uñas y cuidando pies.",
      descripcion:
        "Diana es experta en manicura semipermanente, diseño de uñas y cuidado de cutículas. Su pasión es hacer que cada cliente se sienta única y especial.",
      imagen: diana,
    },
    {
      nombre: "Patricia Aldana",
      especialidad: "Estilista y Peinados",
      experiencia: "7 años creando peinados elegantes y modernos.",
      descripcion:
        "Patricia transforma tu look con estilos personalizados y asesoría según tu tipo de rostro y ocasión. Siempre a la vanguardia de las tendencias.",
      imagen: patricia,
    },
    {
      nombre: "Yenny Aldana",
      especialidad: "Depilación y Cuidado de la Piel",
      experiencia: "6 años de experiencia en depilación y tratamientos de piel.",
      descripcion:
        "Yenny asegura que cada sesión sea cómoda y efectiva, usando técnicas suaves y productos de alta calidad para pieles sensibles.",
      imagen: Yenny,
    },
    {
      nombre: "Maria del Pilar",
      especialidad: "Coloración y Tratamientos Capilares",
      experiencia: "8 años transformando cabellos con color y brillo.",
      descripcion:
        " maria combina creatividad y técnica para lograr cambios de color vibrantes y mantener tu cabello sano, hidratado y brillante.",
      imagen: maria,
    },
  ];

  return (
    <div className="profesionales-container">
      {profesionales.map((prof, index) => (
        <div key={index} className="profesional-card">
          <img src={prof.imagen} alt={prof.nombre} className="profesional-img" />
          <h3>{prof.nombre}</h3>
          <h4>{prof.especialidad}</h4>
          <p>{prof.experiencia}</p>
          <p>{prof.descripcion}</p>
        </div>
      ))}
    </div>
  );
}
