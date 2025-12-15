import React, { useState } from "react";
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
  FaClock
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

// ⭐ NUEVOS IMPORTS ⭐
import piedras from "../assets/img/piedras.png";
import spa from "../assets/img/spa.png";

// ⭐ BANNER IMPORT ⭐
import banner from "../assets/img/banner.png";

import "./HomePage.css";

function HomePage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  const products = [
    {
      id: 1,
      name: "Manicura Tradicional",
      price: 25000,
      icon: <FaHandSparkles />,
      img: manicure1,
      description:
        "Corte, limado, limpieza y esmaltado con productos de primera. Tratamiento nutritivo para las cutículas."
    },
    {
      id: 2,
      name: "Pedicura Profesional",
      price: 30000,
      icon: <FaSpa />,
      img: manicure2,
      description:
        "Exfoliación, hidratación profunda y esmaltado con acabado duradero. Relajación y cuidado integral de pies."
    },
    {
      id: 3,
      name: "Tinte de Cabello",
      price: 90000,
      icon: <FaGem />,
      img: foto1,
      description:
        "Coloración profesional con productos que respetan la fibra capilar. Consulta previa para mejor resultado."
    },
    {
      id: 4,
      name: "Depilación Corporal",
      price: 50000,
      icon: <FaLeaf />,
      img: depil,
      description:
        "Técnicas suaves y efectivas para pieles sensibles. Terminación hidratante para evitar irritaciones."
    },
    {
      id: 5,
      name: "Esmalte Semipermanente",
      price: 20000,
      icon: <FaHandSparkles />,
      img: manicure3,
      description:
        "Acabado brillante y duradero, sin descamar, ideal para quienes buscan duración y brillo profesional."
    },
    {
      id: 6,
      name: "Pack Facial Rejuvenecedor",
      price: 45000,
      icon: <FaPumpSoap />,
      img: foto2,
      description:
        "Limpieza profunda, mascarilla hidratante, masaje facial y protección para una piel luminosa y suave."
    }
  ];

  const addToCart = (p) => setCart((s) => [...s, p]);
  const removeFromCart = (i) => setCart((s) => s.filter((_, idx) => idx !== i));
  const getTotal = () => cart.reduce((acc, it) => acc + it.price, 0);

  return (
    <div className="home-container">

      {/* BOTÓN FLOTANTE ÚNICO DEL CARRITO */}
      <button className="floating-cart-btn" onClick={() => setCartOpen(true)}>
        <FaShoppingCart />
        <span className="cart-count">{cart.length}</span>
      </button>

      {/* ⭐⭐ BANNER ANIMADO ⭐⭐ */}
      <div className="banner-hero">
        <img src={banner} alt="Banner Patty Spa" className="banner-hero-img" />
      </div>

      {/* ⭐⭐ SECCIÓN CON TUS DOS IMÁGENES NUEVAS ⭐⭐ */}
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

      {/* BANNER ORIGINAL */}
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
          <a href="/agendamiento"><button className="cta-primary">Agendar ahora</button></a>
          <a href="/register"><button className="cta-secondary">Regístrate</button></a>
        </div>
      </section>

      <div className="separator" />

      {/* SERVICES */}
      <section id="servicios" className="section services-section">
        <h2 className="section-title">Servicios destacados</h2>
        <p className="services-intro">
          Nuestro catálogo está pensado para cubrir desde cuidados básicos hasta tratamientos especializados.
          Trabajamos con protocolos seguros y productos seleccionados para cada necesidad.
        </p>

        <div className="services-grid">
          <article className="service-card">
            <div className="service-icon"><FaHandSparkles /></div>
            <h3>Manicura & Manicuría</h3>
            <p>
              Tratamiento completo: limpieza, remodelado, esmaltado (tradicional o semipermanente),
              tratamiento nutritivo para cutículas y masaje relajante de manos.
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
              Técnicas modernas de color, mechas y cobertura. Uso de productos de protección capilar antes y después.
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
              Combinaciones con descuento: manos + pies, facial + masaje, día de spa completo.
              Ideal para ocasiones especiales.
            </p>
            <div className="service-meta"><FaClock /> Duración: variable</div>
          </article>
        </div>
      </section>

      <div className="separator" />

      {/* PRODUCTS */}
      <section id="productos" className="section productos-section">
        <h2 className="section-title">Catálogo — Productos y servicios</h2>
        <p className="products-intro">
          Productos y tratamientos seleccionados por nuestras especialistas. Compra en línea o reserva servicio.
        </p>

        <div className="products-grid">
          {products.map((p) => (
            <article className="product-card" key={p.id}>
              <div className="product-media">
                <img src={p.img} alt={p.name} />
              </div>

              <div className="product-body">
                <div className="product-icon">{p.icon}</div>
                <h3>{p.name}</h3>
                <p className="product-desc">{p.description}</p>

                <div className="product-footer">
                  <strong className="product-price">{p.price.toLocaleString()} COP</strong>
                  <button className="product-add" onClick={() => addToCart(p)}>
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="separator" />

      {/* BLOG */}
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

      {/* CONTACTO */}
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

      {/* CARRITO LATERAL */}
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
                <li key={idx}>
                  <span>{it.name}</span>
                  <span>{it.price.toLocaleString()} COP</span>
                  <button className="cart-remove" onClick={() => removeFromCart(idx)}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-total">
              <strong>Total:</strong> {getTotal().toLocaleString()} COP
            </div>

            <button className="checkout-btn" onClick={() => alert("Funcionalidad de pago pendiente")}>
              Finalizar compra
            </button>
          </>
        )}
      </div>

      <footer className="footer">
        <p>© {new Date().getFullYear()} Patty Spa — Cuidado profesional y cariño en cada servicio.</p>
      </footer>
    </div>
  );
}

export default HomePage;
