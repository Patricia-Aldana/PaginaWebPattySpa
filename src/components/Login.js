import Welcome from './components/Welcome';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Welcome />
        <Login /> {/* Renderizar el componente de inicio de sesión */}
      </header>
    </div>
  );
}

export default App;
