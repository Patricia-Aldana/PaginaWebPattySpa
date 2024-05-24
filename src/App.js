import React from 'react';
import estrella from './assents/img/estrella.png';
import manic from './assents/img/manic.png';
import depil from './assents/img/depil.png';
import manicp from './assents/img/manicp.png';
import './App.css'; // Importa los estilos CSS de la aplicación
import Welcome from './components/Welcome';
import LoginForm from './components/LoginForm';
import Services from './components/Services';

function App() {
  return (
    <div className="App">
      <img src={estrella} alt="" className="star-image" />

      <header className="App-header">
        <Welcome />
        <LoginForm />
        <Services />
      </header>

      <div className="image-container">
        <img src={manic} alt=""/>
        <img src={depil} alt=""/>
        <img src={manicp} alt=""/>
      </div>
    </div>
  );
}

export default App;
