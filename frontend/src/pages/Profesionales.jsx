import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

import dianaImg from "../assets/img/diana.png";
import patriciaImg from "../assets/img/patricia.png";
import yennyImg from "../assets/img/yenny.png";
import mariaImg from "../assets/img/maria-del-pilar.png";

import "./Profesionales.css";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");

const slugify = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function Profesionales() {
  const navigate = useNavigate();
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const perfilesExtra = useMemo(() => {
    return {
      [normalizeText("Diana Escobar")]: {
        imagen: dianaImg,
        experiencia: "Especialista en cuidado estético y atención detallada.",
        descripcion:
          "Brinda una experiencia amable, pulida y profesional en cada servicio, cuidando técnica, higiene y resultados.",
        certificacion: "Formación en atención estética y protocolos de cuidado.",
        servicios: "Manicura • Pedicura • Atención estética",
        horario: "Lunes a sábado • 9:00 a. m. - 6:00 p. m.",
        frase: "Cada detalle cuenta para que te sientas increíble.",
      },
      [normalizeText("Patricia Aldana")]: {
        imagen: patriciaImg,
        experiencia: "Trayectoria en servicios de belleza con enfoque humano.",
        descripcion:
          "Combina experiencia, calidez y atención personalizada para que cada clienta viva una experiencia de bienestar.",
        certificacion: "Experiencia profesional en servicios de belleza y spa.",
        servicios: "Manicura • Pedicura • Atención personalizada",
        horario: "Lunes a sábado • 8:00 a. m. - 6:00 p. m.",
        frase: "La belleza también se siente en el trato.",
      },
      [normalizeText("Yenny Cabi")]: {
        imagen: yennyImg,
        experiencia: "Especialista en imagen, estilo y cuidado estético.",
        descripcion:
          "Acompaña cada servicio con criterio profesional y gusto por los acabados bien hechos, buscando armonía y confianza.",
        certificacion: "Formación en estilismo y atención integral.",
        servicios: "Estilismo • Color • Belleza integral",
        horario: "Lunes a sábado • 9:00 a. m. - 6:00 p. m.",
        frase: "Tu mejor versión empieza con un buen cuidado.",
      },
      [normalizeText("María del Pilar Gómez")]: {
        imagen: mariaImg,
        experiencia: "Experiencia en coloración y servicios capilares.",
        descripcion:
          "Destaca por su precisión, asesoría y gusto por los cambios de look con resultados armónicos y elegantes.",
        certificacion: "Capacitación en color, cuidado capilar y asesoría de imagen.",
        servicios: "Coloración • Tratamientos capilares • Asesoría",
        horario: "Lunes a viernes • 10:00 a. m. - 6:00 p. m.",
        frase: "Un buen cambio puede transformar tu día.",
      },
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const cargarProfesionales = async () => {
      try {
        setLoading(true);
        const lista = await api.getProfesionales(true);

        if (!mounted) return;

        const enriquecidos = lista.map((p) => {
          const extra = perfilesExtra[normalizeText(p.nombre)] || {};

          return {
            ...p,
            slug: slugify(p.nombre),
            imagen: extra.imagen || patriciaImg,
            experiencia:
              extra.experiencia ||
              `Profesional en ${p.especialidad || "belleza y bienestar"}.`,
            descripcion:
              extra.descripcion ||
              "Atención dedicada, protocolos de cuidado y una experiencia pensada para tu bienestar.",
            certificacion:
              extra.certificacion ||
              "Experiencia práctica y formación en atención estética.",
            servicios:
              extra.servicios ||
              `${p.especialidad || "Servicios de belleza"} • Atención personalizada`,
            horario:
              extra.horario || "Lunes a sábado • 8:00 a. m. - 6:00 p. m.",
            frase:
              extra.frase || "Tu bienestar también merece tiempo y cuidado.",
          };
        });

        setProfesionales(enriquecidos);
      } catch (error) {
        console.error("Error cargando profesionales:", error);
        setMensaje("No se pudieron cargar las profesionales.");
        setProfesionales([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    cargarProfesionales();

    return () => {
      mounted = false;
    };
  }, [perfilesExtra]);

  const agendar = (slug) => {
    navigate(`/agendamiento?profesional=${encodeURIComponent(slug)}`);
  };

  return (
    <div className="profesionales-container">
      <div className="profesionales-header">
        <h2 className="titulo-prof">Nuestras Profesionales</h2>
        <p>
          Conoce al equipo de Patty Spa y agenda con la profesional que mejor se
          adapte al servicio que deseas.
        </p>
      </div>

      {mensaje && <div className="profesionales-alert">{mensaje}</div>}

      {loading ? (
        <p className="profesionales-loading">Cargando profesionales...</p>
      ) : profesionales.length === 0 ? (
        <p className="profesionales-loading">No hay profesionales disponibles.</p>
      ) : (
        <div className="fila-horizontal">
          {profesionales.map((prof) => (
            <div key={prof._id} className="prof-card">
              <img src={prof.imagen} alt={prof.nombre} className="prof-img" />

              <h3>{prof.nombre}</h3>
              <h4>{prof.especialidad}</h4>

              <p className="texto-exp">{prof.experiencia}</p>
              <p className="texto-desc">{prof.descripcion}</p>

              <p className="extra">
                <strong>Certificación:</strong> {prof.certificacion}
              </p>
              <p className="extra">
                <strong>Servicios:</strong> {prof.servicios}
              </p>
              <p className="extra">
                <strong>Horario:</strong> {prof.horario}
              </p>
              <p className="extra frase">“{prof.frase}”</p>

              <button className="btn-agendar" onClick={() => agendar(prof.slug)}>
                Agendar con ella
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profesionales;