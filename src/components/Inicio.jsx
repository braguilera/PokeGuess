import React, { useContext, useEffect, useRef, useState } from 'react'
import { cn } from "../lib/utils";
import { DotPattern } from "./magicUI/DotPattern";
import { HyperText } from './magicUI/HyperText';
import { ShimmerButton } from './magicUI/ShimmerButton';
import { motion, transform } from 'framer-motion';
import MarqueeComponente from './magicUI/MarqueeDemoVertical'
import { useNavigate } from 'react-router-dom';
import { FileTreeDemo } from './magicUI/FileTreeDemo';
import { DockDemo } from './magicUI/DockDemo';
import Contexto from '../contexto/Contexto';
import {useTranslation} from "react-i18next"

const Proyectos = () => {
    const [pokemonJson, setPokemonJson] = useState();
    const [isGuess, setIsGuess] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {   
        choosePokemon();
    },[]);
    
    const choosePokemon = () => {
        let randomId = Math.floor(Math.random() * (152 - 1) + 1 );

        fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
        .then(response => response.json())
        .then(pokemon => setPokemonJson(pokemon))
        .catch(error => {
            console.error('Error:', error)
        })
    };

    const comparator  = (e)  =>{
        let respuesta = e.target.value;
        if (pokemonJson.name === respuesta) {
            setIsGuess(true);
            setTimeout(function(){
                inputRef.current.value = "";
                setIsGuess(false);
                choosePokemon(); 
            },1000);
        }
    
    }
    
    return (
        <section className='flex flex-col items-center justify-center w-screen bg-red-400 h-screen'>
            <header>
                <h1>PokeGuess</h1>
                <h2>Adivina el pokemon</h2>
            </header>
            <main className='flex flex-col relative'>
                <img
                    src={pokemonJson && pokemonJson.sprites.front_default}
                    className={`absolute z-10 transition-all ${
                        isGuess ? 'brightness-100' : 'brightness-0'
                    }`}
                    alt={pokemonJson?.name || "Pokemon"}
                />
                <img
                    src={pokemonJson && pokemonJson.sprites.front_default}
                    alt={pokemonJson?.name || "Pokemon"}
                />
                <p>{pokemonJson && pokemonJson.name}</p>
            </main>
            <footer>
                <input ref={inputRef} onChange={comparator}/>
                <button onClick={()=> (choosePokemon(), inputRef.current.value = "")}>Saltar</button>
            </footer>
            
        </section>
    )
}

export default Proyectos;
