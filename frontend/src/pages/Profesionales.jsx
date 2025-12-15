import React from "react";
import { useNavigate } from "react-router-dom";

import dianaImg from "../assets/img/diana.png";
import patriciaImg from "../assets/img/patricia.png";
import yennyImg from "../assets/img/yenny.png";
import mariaImg from "../assets/img/maria-del-pilar.png";

import "./Profesionales.css";

function Profesionales() {
  const navigate = useNavigate();

  const profesionales = [
    {
      id: "diana",
      nombre: "Diana Escobar",
      especialidad: "Manicura y Pedicura",
      experiencia: "5 años de experiencia embelleciendo uñas y cuidando pies.",
      descripcion:
        "Especialista en manicura semipermanente, uñas en gel, diseño creativo y cuidado profundo de cutículas.",
      certificacion: "Certificada en Manicura Rusa y Técnica Soft Gel (2024).",
      servicios: "Manicura rusa • Pedicura spa • Uñas semipermanentes",
      horario: "Lunes a sábado • 9:00 am - 6:00 pm",
      frase: "La belleza empieza en los detalles.",
      imagen: dianaImg,
    },
    {
      id: "patricia",
      nombre: "Patricia Aldana",
      especialidad: "Estilista y Peinados",
      experiencia: "7 años creando peinados elegantes y modernos.",
      descripcion:
        "Transforma cada look con peinados profesionales, asesoría de imagen y técnicas actuales.",
      certificacion: "Curso Profesional de Alta Peluquería • Bogotá.",
      servicios: "Peinados • Cepillados • Plancha • Ondas • Asesoría de imagen",
      horario: "Lunes a sábado • 8:00 am - 7:00 pm",
      frase: "Tu estilo habla antes que tú.",
      imagen: patriciaImg,
    },
    {
      id: "yenny",
      nombre: "Yenny Aldana",
      especialidad: "Depilación y Cuidado de la Piel",
      experiencia: "6 años en depilación y tratamientos para piel sensible.",
      descripcion:
        "Tratamientos suaves, seguros y efectivos para mantener la piel saludable y sin irritaciones.",
      certificacion: "Especialista en Depilación Profesional con Cera Natural.",
      servicios: "Depilación corporal • Facial • Exfoliación y cuidado de la piel",
      horario: "Martes a domingo • 9:00 am - 6:00 pm",
      frase: "La piel cuidada es confianza pura.",
      imagen: yennyImg,
    },
    {
      id: "maria",
      nombre: "María del Pilar",
      especialidad: "Coloración y Tratamientos Capilares",
      experiencia: "8 años transformando cabellos con color y brillo.",
      descripcion:
        "Dominio de colorimetría, técnicas modernas y tratamientos para recuperar el cabello.",
      certificacion: "Colorista Profesional Certificada (2023).",
      servicios: "Tintura • Balayage • Iluminaciones • Botox capilar",
      horario: "Lunes a viernes • 10:00 am - 6:00 pm",
      frase: "El color correcto puede cambiar tu día.",
      imagen: mariaImg,
    },
  ];

  const agendar = (id) => {
    navigate(`/agendamiento?profesional=${id}`);
  };

  return (
    <div className="profesionales-container">
      <h2 className="titulo-prof">Nuestras Profesionales</h2>

      <div className="fila-horizontal">
        {profesionales.map((prof) => (
          <div key={prof.id} className="prof-card">
            <img src={prof.imagen} alt={prof.nombre} className="prof-img" />

            <h3>{prof.nombre}</h3>
            <h4>{prof.especialidad}</h4>

            <p className="texto-exp">{prof.experiencia}</p>
            <p className="texto-desc">{prof.descripcion}</p>

            <p className="extra"><strong>Certificación:</strong> {prof.certificacion}</p>
            <p className="extra"><strong>Servicios:</strong> {prof.servicios}</p>
            <p className="extra"><strong>Horario:</strong> {prof.horario}</p>
            <p className="extra frase">“{prof.frase}”</p>

            <button className="btn-agendar" onClick={() => agendar(prof.id)}>
              Agendar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profesionales;
