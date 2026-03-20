import React from "react";

import champu from "../assets/img/champu.jpg";
import esmalteRapido from "../assets/img/esmalte-rapido.jpg";
import mascarilla from "../assets/img/facial.jpg";
import cremahidratante from "../assets/img/crema-hidratante.jpg";
import exfoliante from "../assets/img/exfoliante.jpg";
import acondicionador from "../assets/img/acondicionador.jpg";
import endurecedor from "../assets/img/endurecedor.jpg";
import aceitelavanda from "../assets/img/aceite-lavanda.jpg";

function Productos() {
  return (
    <div>
      <h2>Productos del Spa</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <img src={champu} alt="Champú" width="200" />
          <p>Champú</p>
        </div>
        <div>
          <img src={esmalteRapido} alt="Esmalte rápido" width="200" />
          <p>Esmalte rápido</p>
        </div>
        <div>
          <img src={aceitelavanda} alt="Aceite lavanda" width="200" />
          <p>Aceite de lavanda</p>
        </div>
        <div>
          <img src={mascarilla} alt="Mascarilla" width="200" />
          <p>Mascarilla</p>
        </div>
        <div>
          <img src={cremahidratante} alt="Crema humectante" width="200" />
          <p>Crema de manos</p>
        </div>
        <div>
          <img src={exfoliante} alt="Exfoliante" width="200" />
          <p>Exfoliante</p>
        </div>
        <div>
          <img src={acondicionador} alt="Acondicionador" width="200" />
          <p>Acondicionador</p>
        </div>
        <div>
          <img src={endurecedor} alt="Endurecedor" width="200" />
          <p>Endurecedor</p>
        </div>
      </div>
    </div>
  );
}

export default Productos;