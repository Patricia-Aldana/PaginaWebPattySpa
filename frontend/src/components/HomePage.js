import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaShoppingCart,
  FaHandSparkles,
  FaSpa,
  FaLeaf,
  FaGem,
  FaPumpSoap,
  FaHandHoldingHeart,
  FaWhatsapp,
  FaEnvelope,
  FaInstagram,
  FaClock,
} from "react-icons/fa";

import estrella from "../assets/img/estrella.png";
import depil from "../assets/img/depil.png";
import manic from "../assets/img/manic.png";
import foto1 from "../assets/img/foto1.png";
import foto2 from "../assets/img/foto2.png";
import foto3 from "../assets/img/foto3.png";
import manicure1 from "../assets/img/manicure1.jpeg";
import manicure2 from "../assets/img/manicure2.jpeg";
import manicure3 from "../assets/img/manicure3.jpeg";
import piedras from "../assets/img/piedras.png";
import spa from "../assets/img/spa.png";
import banner from "../assets/img/banner.png";

import corteHombre from "../assets/img/cortehombre.png";
import corteMujer from "../assets/img/cortemujer.jpg";
import facialImg from "../assets/img/facial.jpg";
import tinteImg from "../assets/img/tinte.png";
import pedicureImg from "../assets/img/pedicure.jpg";
import masajeReductor from "../assets/img/reductor.jpg";
import masajeDeportivo from "../assets/img/deportivo.jpg";
import masajeRelajante from "../assets/img/relajante.jpg";
import ceraImg from "../assets/img/cera.jpg";
import piesImg from "../assets/img/pies.jpg";

import champuImg from "../assets/img/champu.jpg";
import acondicionadorImg from "../assets/img/acondicionador.jpg";
import endurecedorImg from "../assets/img/endurecedor.jpg";
import exfolianteImg from "../assets/img/exfoliante.jpg";
import mascarillaImg from "../assets/img/mascarilla.jpg";
import cremaHidratanteImg from "../assets/img/crema-hidratante.jpg";
import aceiteLavandaImg from "../assets/img/aceite-lavanda.jpg";
import esmalteRapidoImg from "../assets/img/esmalte-rapido.jpg";

import { api, API_URL } from "../services/api";
import "./HomePage.css";

const safeJSONParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const cleanText = (value) => String(value ?? "").trim();
const norm = (t) => cleanText(t).toLowerCase().replace(/\s+/g, " ");

const obtenerUsuarioActual = () => {
  return safeJSONParse(localStorage.getItem("usuario"), null);
};

function HomePage({ cartOpen: cartOpenProp, setCartOpen: setCartOpenProp }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [internalCartOpen, setInternalCartOpen] = useState(false);

  const cartOpen =
    typeof cartOpenProp === "boolean" ? cartOpenProp : internalCartOpen;

  const setCartOpen =
    typeof setCartOpenProp === "function"
      ? setCartOpenProp
      : setInternalCartOpen;

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("pattyspa_cart");
    return safeJSONParse(saved, []);
  });

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);

  useEffect(() => {
    localStorage.setItem("pattyspa_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const openCart = params.get("openCart");

    if (openCart === "1") {
      setCartOpen(true);
    }
  }, [location.search, setCartOpen]);

  const formatoCOP = useMemo(() => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    });
  }, []);

  const PRODUCT_IMAGE_MAP = useMemo(() => {
    return {
      "exfoliante.jpg": exfolianteImg,
      "acondicionador.jpg": acondicionadorImg,
      "crema-hidratante.jpg": cremaHidratanteImg,
      "mascarilla.jpg": mascarillaImg,
      "aceite-lavanda.jpg": aceiteLavandaImg,
      "endurecedor.jpg": endurecedorImg,
      "champu.jpg": champuImg,
      "champú.jpg": champuImg,
      "esmalte-rapido.jpg": esmalteRapidoImg,

      [norm("Exfoliante")]: exfolianteImg,
      [norm("Acondicionador")]: acondicionadorImg,
      [norm("Crema Hidratante")]: cremaHidratanteImg,
      [norm("Mascarilla Facial")]: mascarillaImg,
      [norm("Aceite Esencial Lavanda")]: aceiteLavandaImg,
      [norm("Endurecedor de Uñas")]: endurecedorImg,
      [norm("Champú Reparador")]: champuImg,
      [norm("Champu Reparador")]: champuImg,
      [norm("Esmalte Secado Rápido")]: esmalteRapidoImg,
      [norm("Esmalte Secado Rapido")]: esmalteRapidoImg,
    };
  }, []);

  const MEDIA_BY_NAME = useMemo(() => {
    return {
      [norm("Manicura Tradicional")]: { img: manicure1 },
      [norm("Pedicura Profesional")]: { img: piesImg },
      [norm("Tinte de Cabello")]: { img: tinteImg },
      [norm("Depilación Corporal")]: { img: ceraImg },
      [norm("Esmalte Semipermanente")]: { img: manicure3 },
      [norm("Pack Facial Rejuvenecedor")]: { img: facialImg },
      [norm("Corte de Cabello Hombre")]: { img: corteHombre },
      [norm("Corte de Cabello Mujer")]: { img: corteMujer },
      [norm("Manicure")]: { img: manic },
      [norm("Manicura")]: { img: manic },
      [norm("Pedicure")]: { img: pedicureImg },
      [norm("Pedicura")]: { img: pedicureImg },
      [norm("Masaje Relajante")]: { img: piedras },
      [norm("Depilación de Cejas")]: { img: depil },
    };
  }, []);

  const DISPLAY_NAME_BY_NAME = useMemo(() => {
    return {
      [norm("Manicure")]: "Cambio de esmalte",
      [norm("Manicura")]: "Cambio de esmalte",
      [norm("Pedicure")]: "Pedicura cambio de esmalte",
      [norm("Pedicura")]: "Pedicura cambio de esmalte",
    };
  }, []);

  const DESCRIPTION_BY_NAME = useMemo(() => {
    const descCambio = "Limado, hidratación y esmaltado tradicional.";

    return {
      [norm("Manicura Tradicional")]:
        "Un ritual completo para tus manos: corte y limado profesional, limpieza profunda, cuidado de cutículas, esmaltado tradicional y un masaje hidratante para dejar tus manos suaves, elegantes y saludables.",

      [norm("Pedicura Profesional")]:
        "Cuidado premium para tus pies: exfoliación, hidratación profunda y esmaltado con acabado duradero. Finalizamos con un toque relajante para una sensación de descanso total.",

      [norm("Tinte de Cabello")]:
        "Coloración profesional con asesoría personalizada. Incluye preparación del cabello, aplicación uniforme y sellado del color para un resultado brillante y duradero.",

      [norm("Depilación Corporal")]:
        "Depilación con cera para una piel suave y uniforme. Técnica cuidadosa para reducir irritación y finalización calmante para proteger tu piel.",

      [norm("Esmalte Semipermanente")]:
        "Esmaltado semipermanente con brillo intenso y mayor duración. Incluye preparación de la uña, aplicación por capas y sellado para un acabado profesional.",

      [norm("Pack Facial Rejuvenecedor")]:
        "Tratamiento facial completo: limpieza profunda, mascarilla hidratante, masaje facial y protección para una piel luminosa, suave y fresca.",

      [norm("Corte de Cabello Hombre")]:
        "Corte masculino con acabado limpio y moderno. Incluye asesoría según tu estilo, perfilado y retoques de contorno para un look impecable.",

      [norm("Corte de Cabello Mujer")]:
        "Corte femenino con asesoría de estilo. Incluye definición de forma, puntas y capas según tu preferencia para resaltar tu look.",

      [norm("Masaje Relajante")]:
        "Masaje corporal para liberar tensión y mejorar el bienestar. Técnicas suaves y profundas para relajar, descansar y recargar energía.",

      [norm("Depilación de Cejas")]:
        "Diseño y depilación de cejas para realzar tu mirada. Definimos forma según tu rostro y finalizamos con hidratación para cuidar la piel.",

      [norm("Manicure")]: descCambio,
      [norm("Manicura")]: descCambio,
      [norm("Pedicure")]: descCambio,
      [norm("Pedicura")]: descCambio,
    };
  }, []);

  const DURATION_BY_NAME = useMemo(() => {
    return {
      [norm("Corte de Cabello Hombre")]: 30,
      [norm("Corte de Cabello Mujer")]: 40,
      [norm("Depilación Corporal")]: 40,
      [norm("Depilación de Cejas")]: 15,
      [norm("Esmalte Semipermanente")]: 60,
      [norm("Manicura Tradicional")]: 45,
      [norm("Manicure")]: 20,
      [norm("Manicura")]: 20,
      [norm("Masaje Relajante")]: 60,
      [norm("Pack Facial Rejuvenecedor")]: 60,
      [norm("Pedicura Profesional")]: 50,
      [norm("Pedicure")]: 20,
      [norm("Pedicura")]: 20,
      [norm("Tinte de Cabello")]: 90,
    };
  }, []);

  const resolverImagenServicio = (key) => {
    if (MEDIA_BY_NAME[key]?.img) return MEDIA_BY_NAME[key].img;

    if (key.includes("hombre")) return corteHombre;
    if (key.includes("mujer")) return corteMujer;
    if (key.includes("manic") || key.includes("manos")) return manicure1;
    if (key.includes("pedic") || key.includes("pies")) return piesImg;
    if (key.includes("depil")) return ceraImg;
    if (key.includes("tinte")) return tinteImg;
    if (key.includes("facial")) return facialImg;
    if (key.includes("masaje relajante")) return masajeRelajante;
    if (key.includes("masaje reductor")) return masajeReductor;
    if (key.includes("masaje deportivo")) return masajeDeportivo;
    if (key.includes("masaje")) return piedras;

    return spa;
  };

  const resolverImagenProducto = (p) => {
    const nombreKey = norm(p?.nombre);
    const imagenKey = cleanText(p?.imagenUrl || p?.fotoUrl || "").toLowerCase();

    if (PRODUCT_IMAGE_MAP[nombreKey]) return PRODUCT_IMAGE_MAP[nombreKey];
    if (PRODUCT_IMAGE_MAP[imagenKey]) return PRODUCT_IMAGE_MAP[imagenKey];

    if (/^https?:\/\//i.test(imagenKey)) return imagenKey;

    if (imagenKey.startsWith("/uploads/")) {
      return `${API_URL}${imagenKey}`;
    }

    if (imagenKey) {
      return `${API_URL}/uploads/${imagenKey}`;
    }

    return spa;
  };

  const pedirLogin = (next, mensaje) => {
    alert(mensaje);
    navigate(`/login?next=${encodeURIComponent(next)}`);
  };

  const handleIrAgendamiento = () => {
    const usuario = obtenerUsuarioActual();

    if (!usuario) {
      pedirLogin("/agendamiento", "Debes iniciar sesión para agendar.");
      return;
    }

    navigate("/agendamiento");
  };

  const addToCart = (p) => {
    setCart((prev) => [
      ...prev,
      {
        id: p.id,
        name: p.name,
        price: p.price,
        img: p.img,
        description: p.description,
        durationMinutos: p.durationMinutos,
      },
    ]);
  };

  const handleAddToCart = (p) => {
    const usuario = obtenerUsuarioActual();

    if (!usuario) {
      pedirLogin("/?openCart=1", "Debes iniciar sesión para comprar.");
      return;
    }

    addToCart(p);
    setCartOpen(true);
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const getTotal = () => {
    return cart.reduce((acc, it) => acc + (Number(it.price) || 0), 0);
  };

  const handleCheckout = () => {
    const usuario = obtenerUsuarioActual();

    if (!usuario) {
      pedirLogin("/?openCart=1", "Debes iniciar sesión para finalizar la compra.");
      return;
    }

    if (cart.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    alert("✅ Compra permitida (Funcionalidad de pago pendiente)");
  };

  useEffect(() => {
    let cancelado = false;

    const fetchCatalogo = async () => {
      try {
        setLoadingCatalogo(true);

        const listaServicios = await api.getServicios(true);

        const activosServicios = listaServicios
          .filter((s) => s && s.activo !== false)
          .sort((a, b) =>
            cleanText(a.nombre).localeCompare(cleanText(b.nombre), "es", {
              sensitivity: "base",
            })
          );

        const cardsServicios = activosServicios.map((s) => {
          const key = norm(s.nombre);
          const displayName = DISPLAY_NAME_BY_NAME[key] || cleanText(s.nombre);

          const descFromDb = cleanText(s.descripcion);
          const descMap = DESCRIPTION_BY_NAME[key];

          const esCambioEsmalte =
            key === norm("Manicure") ||
            key === norm("Manicura") ||
            key === norm("Pedicure") ||
            key === norm("Pedicura");

          const description = esCambioEsmalte
            ? descMap || "Limado, hidratación y esmaltado tradicional."
            : descFromDb.length >= 35
            ? descFromDb
            : descMap ||
              descFromDb ||
              "Servicio profesional en Patty Spa, realizado con cuidado, higiene y productos de excelente calidad.";

          const durBackend = Number(s.duracionMinutos ?? s.duracion ?? 0);
          const durMap = DURATION_BY_NAME[key];
          const durationMinutos = durBackend > 0 ? durBackend : durMap || 30;

          return {
            id: s._id,
            name: displayName,
            originalName: cleanText(s.nombre),
            price: Number(s.precio) || 0,
            durationMinutos,
            img: resolverImagenServicio(key),
            description,
          };
        });

        if (!cancelado) {
          setServices(cardsServicios);
        }
      } catch (e) {
        console.error("Error cargando catálogo (servicios):", e);

        if (!cancelado) {
          setServices([]);
        }
      } finally {
        if (!cancelado) {
          setLoadingCatalogo(false);
        }
      }
    };

    fetchCatalogo();

    return () => {
      cancelado = true;
    };
  }, [DISPLAY_NAME_BY_NAME, DESCRIPTION_BY_NAME, DURATION_BY_NAME, MEDIA_BY_NAME]);

  useEffect(() => {
    let cancelado = false;

    const fetchProductos = async () => {
      try {
        const listaProductos = await api.getProductos(true);

        const activos = listaProductos
          .filter((p) => p && p.activo !== false)
          .sort((a, b) =>
            cleanText(a.nombre).localeCompare(cleanText(b.nombre), "es", {
              sensitivity: "base",
            })
          );

        const cardsProductos = activos.map((p) => ({
          id: p._id,
          name: cleanText(p.nombre) || "Producto sin nombre",
          price: Number(p.precio) || 0,
          description: cleanText(p.descripcion),
          stock: Number(p.stock ?? p.existencias ?? 0),
          category: cleanText(p.categoria || p.categorias || p["categorías"]),
          img: resolverImagenProducto(p),
          type: "producto",
        }));

        if (!cancelado) {
          setProducts(cardsProductos);
        }
      } catch (e) {
        console.warn("No se pudieron cargar productos:", e?.message || e);

        if (!cancelado) {
          setProducts([]);
        }
      }
    };

    fetchProductos();

    return () => {
      cancelado = true;
    };
  }, [PRODUCT_IMAGE_MAP]);

  return (
    <div className="home-container">
      <button className="floating-cart-btn" onClick={() => setCartOpen(true)}>
        <FaShoppingCart />
        <span className="cart-count">{cart.length}</span>
      </button>

      <div className="banner-hero">
        <img src={banner} alt="Banner Patty Spa" className="banner-hero-img" />
      </div>

      <section className="dual-banner">
        <div className="dual-left">
          <img src={piedras} alt="Piedras de spa" className="dual-img" />
        </div>

        <div className="dual-right">
          <img src={spa} alt="Ambiente spa" className="dual-img" />
        </div>

        <div className="dual-text">
          <h2>Relajación, equilibrio y bienestar</h2>
          <p>
            Un espacio creado para ti. Tratamientos que armonizan cuerpo y mente,
            con la suavidad y el cuidado que mereces.
          </p>
        </div>
      </section>

      <section className="banner">
        <h1 className="banner-title">
          Bienvenida a <span className="accent">Patty Spa</span>
        </h1>

        <p className="banner-sub">
          Un refugio para tu bienestar: tratamientos hechos con cariño, productos profesionales
          y un equipo humano que te acompaña en cada paso. Regálate tiempo para ti: relájate,
          recárgate y sal con una sonrisa.
        </p>

        <div className="banner-cta">
          <button className="cta-primary" onClick={handleIrAgendamiento}>
            Agendar ahora
          </button>

          <button className="cta-secondary" onClick={() => navigate("/register")}>
            Regístrate
          </button>
        </div>
      </section>

      <div className="separator" />

      <section id="servicios" className="section services-section">
        <h2 className="section-title">Servicios destacados</h2>
        <p className="services-intro">
          Nuestro catálogo está pensado para cubrir desde cuidados básicos hasta tratamientos especializados.
          Trabajamos con protocolos seguros y productos seleccionados para cada necesidad.
        </p>

        <div className="services-grid">
          <article className="service-card">
            <div className="service-icon"><FaHandSparkles /></div>
            <h3>Manicura &amp; Manicuría</h3>
            <p>
              Tratamiento completo: limpieza, remodelado, esmaltado (tradicional o semipermanente),
              cuidado nutritivo para cutículas y masaje relajante de manos.
            </p>
            <div className="service-meta"><FaClock /> Duración: ~35 min</div>
          </article>

          <article className="service-card">
            <div className="service-icon"><FaSpa /></div>
            <h3>Pedicura Profesional</h3>
            <p>
              Exfoliación, eliminación de durezas, hidroterapia y esmaltado. Incluye masaje y tratamiento hidratante.
            </p>
            <div className="service-meta"><FaClock /> Duración: ~45 min</div>
          </article>

          <article className="service-card">
            <div className="service-icon"><FaGem /></div>
            <h3>Tintes y coloración</h3>
            <p>
              Técnicas modernas de color, mechas y cobertura. Productos de protección capilar antes y después.
            </p>
            <div className="service-meta"><FaClock /> Duración: ~90 min</div>
          </article>

          <article className="service-card">
            <div className="service-icon"><FaLeaf /></div>
            <h3>Depilación con cera</h3>
            <p>
              Técnicas seguras y productos calmantes post-depilación. Opciones para piel sensible.
            </p>
            <div className="service-meta"><FaClock /> Duración: 20–40 min</div>
          </article>

          <article className="service-card">
            <div className="service-icon"><FaPumpSoap /></div>
            <h3>Faciales y tratamientos</h3>
            <p>
              Limpieza facial profunda, mascarillas específicas, masajes y tratamientos según tipo de piel.
            </p>
            <div className="service-meta"><FaClock /> Duración: ~50 min</div>
          </article>

          <article className="service-card">
            <div className="service-icon"><FaHandHoldingHeart /></div>
            <h3>Paquetes de bienestar</h3>
            <p>
              Combinaciones con descuento: manos + pies, facial + masaje o día de spa completo.
              Ideal para ocasiones especiales.
            </p>
            <div className="service-meta"><FaClock /> Duración: variable</div>
          </article>
        </div>
      </section>

      <div className="separator" />

      <section id="catalogo" className="section productos-section">
        <h2 className="section-title">Servicios</h2>

        {loadingCatalogo ? (
          <p style={{ textAlign: "center" }}>Cargando servicios...</p>
        ) : services.length === 0 ? (
          <p style={{ textAlign: "center", color: "red" }}>
            No hay servicios disponibles.
          </p>
        ) : (
          <div className="products-grid">
            {services.map((p) => (
              <article className="product-card" key={p.id}>
                <div className="product-media">
                  <img src={p.img || banner} alt={p.name} />
                </div>

                <div className="product-body">
                  <h3>{p.name}</h3>

                  <div className="product-duration">
                    <FaClock /> Duración: {p.durationMinutos} min
                  </div>

                  <p className="product-desc">{p.description}</p>

                  <strong className="product-price">
                    {formatoCOP.format(Number(p.price) || 0)}
                  </strong>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="separator" style={{ margin: "60px 0" }} />

        <h2 className="section-title">Productos de la tienda</h2>

        {products.length === 0 ? (
          <p style={{ textAlign: "center", color: "#555" }}>
            No hay productos disponibles por ahora.
          </p>
        ) : (
          <div className="products-grid">
            {products.map((p) => (
              <article className="product-card" key={p.id}>
                <div className="product-media">
                  <img src={p.img} alt={p.name} />
                </div>

                <div className="product-body">
                  <h3>{p.name}</h3>

                  <p className="product-desc">{p.description}</p>

                  <div className="product-footer">
                    <strong className="product-price">
                      {formatoCOP.format(Number(p.price) || 0)}
                    </strong>

                    {p.type === "producto" && (
                      <button
                        className="product-add"
                        onClick={() => handleAddToCart(p)}
                      >
                        Agregar al carrito
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="blog" className="section blog-section">
        <h2 className="section-title">Blog de belleza — Consejos profesionales</h2>

        <div className="blog-columns">
          <article className="blog-card">
            <h3>Rutina de manos: salud y estética</h3>
            <p>
              Las manos hablan por ti. Mantén una rutina: hidratación nocturna, aceite nutritivo,
              protección y exfoliación semanal.
            </p>
          </article>

          <article className="blog-card">
            <h3>Cómo elegir el color ideal</h3>
            <p>
              El color se elige según tono de piel, ocasión y mantenimiento. Hacemos pruebas y asesoría.
            </p>
          </article>

          <article className="blog-card">
            <h3>Cuidado post-depilación</h3>
            <p>
              Evita ropa ajustada 24h, aplica productos calmantes y exfolia después de 72h.
            </p>
          </article>
        </div>
      </section>

      <div className="separator" />

      <section className="section testimonios-section">
        <h2 className="section-title">Lo que dicen nuestras clientas</h2>

        <div className="testimonios-grid">
          <div className="testimonio-card">
            <img src={estrella} alt="Estrellas" className="stars" />
            <p>
              "Excelente atención. Me hice manicure y quedé feliz con el resultado.
              Súper recomendado."
            </p>
            <strong>— Laura M.</strong>
          </div>

          <div className="testimonio-card">
            <img src={estrella} alt="Estrellas" className="stars" />
            <p>
              "El masaje relajante fue increíble. El ambiente es hermoso y muy profesional."
            </p>
            <strong>— Daniela R.</strong>
          </div>

          <div className="testimonio-card">
            <img src={estrella} alt="Estrellas" className="stars" />
            <p>
              "Me encantó el cambio de look con el tinte. Volveré sin duda."
            </p>
            <strong>— Camila P.</strong>
          </div>
        </div>
      </section>

      <div className="separator" />

      <section className="section promo-section">
        <div className="promo-box">
          <h2>✨ Promoción Especial ✨</h2>
          <p>
            Combo Manicure + Pedicure con 15% de descuento.
            Promoción válida por tiempo limitado.
          </p>

          <button className="cta-primary" onClick={handleIrAgendamiento}>
            Reservar promoción
          </button>
        </div>
      </section>

      <div className="separator" />

      <section className="section galeria-section">
        <h2 className="section-title">Nuestros trabajos</h2>

        <div className="galeria-grid">
          <img src={foto1} alt="Trabajo 1" />
          <img src={foto2} alt="Trabajo 2" />
          <img src={foto3} alt="Trabajo 3" />
          <img src={manicure1} alt="Trabajo 4" />
          <img src={manicure2} alt="Trabajo 5" />
          <img src={manicure3} alt="Trabajo 6" />
        </div>
      </section>

      <section id="contacto" className="section contact-section">
        <h2 className="section-title">Contáctanos</h2>
        <p className="contact-text">
          Puedes escribirnos en cualquier momento. También agendamos por teléfono o WhatsApp.
        </p>

        <div className="contact-cards">
          <div className="contact-card">
            <FaEnvelope className="contact-icon" />
            <div>
              <strong>Email</strong>
              <p>contacto@pattyspa.com</p>
            </div>
          </div>

          <div className="contact-card">
            <FaWhatsapp className="contact-icon" />
            <div>
              <strong>WhatsApp</strong>
              <p>+57 3196110585</p>
            </div>
          </div>

          <div className="contact-card">
            <FaInstagram className="contact-icon" />
            <div>
              <strong>Instagram</strong>
              <p>@pattyspa</p>
            </div>
          </div>
        </div>
      </section>

      <div className={`cart-sidebar ${cartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>🛍 Tu Carrito</h3>
          <button className="close-cart" onClick={() => setCartOpen(false)}>
            Cerrar
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="cart-empty">Tu carrito está vacío</p>
        ) : (
          <>
            <ul className="cart-list">
              {cart.map((it, idx) => (
                <li key={`${it.id}-${idx}`}>
                  <span>
                    {it.name} {it.durationMinutos ? `(${it.durationMinutos} min)` : ""}
                  </span>

                  <span>{formatoCOP.format(Number(it.price) || 0)}</span>

                  <button className="cart-remove" onClick={() => removeFromCart(idx)}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-total">
              <strong>Total:</strong> {formatoCOP.format(getTotal())}
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              Finalizar compra
            </button>
          </>
        )}
      </div>

      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Patty Spa — Cuidado profesional y cariño en cada servicio.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;