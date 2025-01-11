import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Inicio from "./components/Inicio";
import { useContext } from "react";
import Contexto from "./contexto/Contexto";

const App = () => {
  const {darkMode} = useContext(Contexto); 

  return (
    <main className={darkMode && "dark"}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Inicio/>}/>

        </Routes>
      </BrowserRouter>
    </main>
    
  )
}

export default App;