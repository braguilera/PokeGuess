import React, { useContext, useEffect, useState } from 'react'
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
    const [pokemonJson, setPokemonJson] = useState()

    const choosePokemon = () => {

        let randomId = Math.floor(Math.random() * (152 - 1) + 1 );

        console.log(randomId);

        fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
        .then(response =>  response.json())
        .then(pokemon => setPokemonJson(pokemon))
        .catch(error => {
            console.error('Error:', error)
        })
    };

    useEffect(() => {   
        choosePokemon();
    },[]);
    
    return (
        <section className='flex flex-col items-center justify-center w-screen bg-red-400 h-screen'>
            <header>
                <h1>PokeGuess</h1>
                <h2>Adivina el pokemon</h2>
            </header>
            <main>
                <img src={pokemonJson.sprites.front_default}></img>
                <p>{pokemonJson.name}</p>
                
            </main>
            <footer>
                <article>
                    <input/>
                    
                    <button onClick={() => (choosePokemon(), console.log(pokemonJson))}>Adivinar</button>
                </article>
                <button>Saltear</button>
            </footer>
            
        </section>
    )
}

export default Proyectos;
