import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PokeGuess = () => {
    const [pokemonJson, setPokemonJson] = useState();
    const [isGuess, setIsGuess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [showStats, setShowStats] = useState(false);
    const inputRef = useRef(null);
    const [showVictoryEffect, setShowVictoryEffect] = useState(false);
    const [spanishName, setSpanishName] = useState("");

    // Objeto con los colores por tipo de Pokémon
    const typeColors = {
        normal: "#A8A878",
        fire: "#F08030",
        water: "#6890F0",
        electric: "#F8D030",
        grass: "#78C850",
        ice: "#98D8D8",
        fighting: "#C03028",
        poison: "#A040A0",
        ground: "#E0C068",
        flying: "#A890F0",
        psychic: "#F85888",
        bug: "#A8B820",
        rock: "#B8A038",
        ghost: "#705898",
        dragon: "#7038F8",
        dark: "#705848",
        steel: "#B8B8D0",
        fairy: "#EE99AC"
    };

    useEffect(() => {
        choosePokemon();
    }, []);

    const getSpanishName = async (id) => {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            const data = await response.json();
            const spanish = data.names.find(name => name.language.name === "es");
            setSpanishName(spanish ? spanish.name : "");
        } catch (error) {
            console.error('Error fetching Spanish name:', error);
        }
    };

    const choosePokemon = () => {
        setIsTransitioning(true);
        setIsGuess(false);
        setShowStats(false);
        setShowVictoryEffect(false);
        let randomId = Math.floor(Math.random() * (152 - 1) + 1);
        fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
            .then((response) => response.json())
            .then((pokemon) => {
                setPokemonJson(pokemon);
                getSpanishName(randomId);
                setIsTransitioning(false);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    const comparator = (respuesta) => {
        respuesta = respuesta?.toLowerCase() || inputRef.current.value.toLowerCase();
        if (pokemonJson.name === respuesta) {
            setIsGuess(true);
            setShowVictoryEffect(true);
            setShowStats(true);
            setScore(prev => prev + 100);
            setStreak(prev => prev + 1);
        } else if (respuesta.trim() !== '') {
            setIsError(true);
            inputRef.current.value = "";
            
            setTimeout(() => {
                setIsError(false);
            }, 600);
        }
    };

    const handleNext = () => {
        choosePokemon();
        inputRef.current.value = "";
    };

    const handleSkip = () => {
        setStreak(0);
        setScore(prev => Math.max(0, prev - 50));
        choosePokemon();
        inputRef.current.value = "";
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            comparator();
        }
    };

    const getPokemonTypeColor = () => {
        if (!pokemonJson) return typeColors.normal;
        const mainType = pokemonJson.types[0].type.name;
        return typeColors[mainType] || typeColors.normal;
    };

    const renderStatsGraph = () => {
        if (!pokemonJson || !showStats) return null;

        const stats = {
            HP: pokemonJson.stats[0].base_stat,
            Attack: pokemonJson.stats[1].base_stat,
            Defense: pokemonJson.stats[2].base_stat,
            'Sp. Attack': pokemonJson.stats[3].base_stat,
            'Sp. Defense': pokemonJson.stats[4].base_stat,
            Speed: pokemonJson.stats[5].base_stat,
        };

        return (
            <div className="relative p-4">
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(stats).map(([stat, value]) => (
                        <div key={stat} className="flex items-center gap-2">
                            <span className="text-sm font-medium w-24">{stat}</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded">
                                <motion.div
                                    className="h-full rounded"
                                    style={{ backgroundColor: getPokemonTypeColor() }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(value / 255) * 100}%` }}
                                    transition={{ duration: 1 }}
                                />
                            </div>
                            <span className="text-sm w-8">{value}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <motion.div 
            className="min-h-screen bg-gradient-to-b from-red-400 to-red-600 p-8 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div 
                className="bg-red-500 rounded-3xl p-8 w-full max-w-6xl relative overflow-hidden shadow-2xl ring-8 ring-red-700 lg:flex lg:gap-8"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {/* Panel izquierdo - Pokédex principal */}
                <div className="flex-1">
                    {/* Luces indicadoras de la Pokédex */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        <motion.div 
                            className="w-6 h-6 bg-blue-400 rounded-full border-4 border-white"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="w-3 h-3 bg-red-300 rounded-full" />
                        <div className="w-3 h-3 bg-yellow-300 rounded-full" />
                        <div className="w-3 h-3 bg-green-300 rounded-full" />
                    </div>

                    {/* Contenido principal */}
                    <div className="mt-8">
                        <motion.div 
                            className="text-center mb-6"
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl font-bold text-white mb-4">PokéGuess</h1>
                            <div className="flex justify-between px-4 text-white">
                                <span>Score: {score}</span>
                                <span>Streak: {streak}</span>
                            </div>
                        </motion.div>

                        {/* Pantalla de la Pokédex */}
                        <motion.div 
                            className="bg-gray-200 rounded-lg p-4 mb-6 relative border-8 border-gray-300"
                            style={{
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                                backgroundColor: isGuess ? getPokemonTypeColor() : '#e5e7eb'
                            }}
                            layout
                        >
                            <AnimatePresence>
                                {showVictoryEffect && (
                                    <motion.div 
                                        className="absolute inset-0 bg-green-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.2 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                )}
                                {isError && (
                                    <motion.div 
                                        className="absolute inset-0 bg-red-500"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.3 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}
                            </AnimatePresence>

                            {pokemonJson && (
                                <motion.img
                                    src={pokemonJson.sprites.front_default}
                                    className="w-48 h-48 mx-auto"
                                    initial={{ 
                                        filter: "brightness(0%)",
                                        scale: 0.9,
                                        opacity: 0 
                                    }}
                                    animate={{ 
                                        filter: isGuess ? "brightness(100%)" : "brightness(0%)",
                                        scale: isGuess ? 1.1 : 1,
                                        opacity: 1,
                                        x: isError ? [-10, 10, -10, 10, 0] : 0
                                    }}
                                    transition={{ 
                                        duration: isError ? 0.4 : 0.5,
                                        bounce: 0.25,
                                        x: { type: "spring", stiffness: 300 }
                                    }}
                                    alt="Pokemon"
                                />
                            )}
                        </motion.div>

                        {/* Controles de la Pokédex */}
                        <div className="space-y-4 relative">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    className="flex-1 px-4 py-2 rounded-lg border-4 border-gray-700 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    style={{
                                        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)'
                                    }}
                                    placeholder="¿Quién es este Pokémon?"
                                    onKeyPress={handleKeyPress}
                                    disabled={isGuess}
                                />
                                <motion.button
                                    onClick={handleSkip}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isGuess}
                                >
                                    ⏭️
                                </motion.button>
                            </div>
                            
                            {/* Pantalla de mensajes */}
                            <motion.div 
                                className="bg-gray-200 rounded-lg p-4 border-4 border-gray-700 min-h-[60px] flex items-center justify-center"
                                style={{
                                    boxShadow: 'inset 0 0 5px rgba(0,0,0,0.2)'
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    {isError && (
                                        <motion.div 
                                            className="text-center text-red-600 font-bold"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            ¡Incorrecto! Intenta de nuevo
                                        </motion.div>
                                    )}
                                    {isGuess && (
                                        <motion.div 
                                            className="text-center font-bold space-y-1"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="text-green-600">
                                                ¡Correcto! Es {pokemonJson.name.toUpperCase()}
                                            </div>
                                            {spanishName && (
                                                <div className="text-sm text-green-500">
                                                    {spanishName}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Botón Siguiente (solo visible cuando se ha adivinado) */}
                            {isGuess && (
                                <motion.button
                                    onClick={handleNext}
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Siguiente Pokémon →
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Panel derecho - Estadísticas (visible en pantallas grandes y solo cuando se adivina) */}
                <motion.div 
                    className="hidden lg:block bg-gray-800 rounded-2xl p-6 flex-1"
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {pokemonJson && showStats && (
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-4">Estadísticas del Pokémon</h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-gray-400">Número:</span>
                                        <p>#{pokemonJson.id.toString().padStart(3, '0')}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Altura:</span>
                                        <p>{pokemonJson.height / 10} m</p>
                                    </div>
                                    <div>
                                    <span className="text-gray-400">Peso:</span>
                                        <p>{pokemonJson.weight / 10} kg</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Tipos:</span>
                                        <div className="flex gap-2">
                                            {pokemonJson.types.map((t, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 rounded-full text-white text-sm"
                                                    style={{ backgroundColor: typeColors[t.type.name] }}
                                                >
                                                    {t.type.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {renderStatsGraph()}
                                
                                {/* Sección de habilidades */}
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold mb-3">Habilidades</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {pokemonJson.abilities.map((ability, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-700 rounded-lg p-2 text-sm"
                                            >
                                                {ability.ability.name}
                                                {ability.is_hidden && (
                                                    <span className="text-xs text-gray-400 ml-2">(Oculta)</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Movimientos destacados */}
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold mb-3">Movimientos Destacados</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {pokemonJson.moves.slice(0, 4).map((move, index) => (
                                            <div
                                                key={index}
                                                className="bg-gray-700 rounded-lg p-2 text-sm"
                                            >
                                                {move.move.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sprites adicionales */}
                                <div className="mt-6">
                                    <h3 className="text-xl font-bold mb-3">Sprites</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {pokemonJson.sprites.back_default && (
                                            <div className="bg-gray-700 rounded-lg p-2">
                                                <img
                                                    src={pokemonJson.sprites.back_default}
                                                    alt="Back sprite"
                                                    className="w-20 h-20 mx-auto"
                                                />
                                                <p className="text-center text-sm mt-2">Vista trasera</p>
                                            </div>
                                        )}
                                        {pokemonJson.sprites.front_shiny && (
                                            <div className="bg-gray-700 rounded-lg p-2">
                                                <img
                                                    src={pokemonJson.sprites.front_shiny}
                                                    alt="Shiny sprite"
                                                    className="w-20 h-20 mx-auto"
                                                />
                                                <p className="text-center text-sm mt-2">Shiny</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

{/*
solo necesito unas ultimas cosas, puedes hacer la animacion cuando adivina como antes, donde la pantalla donde esta el pokemon tenia un leve destello verde como dando la sensacion de que lo hizo bien y tambien cuando pasa de un pokemon a otro, en el proceso de la transicion del brillo de 100 a 0 se ve por un instante el sguiente pokemon con el brillo al 100 y pasa a 0, se podria arreglar eso
*/}

export default PokeGuess;