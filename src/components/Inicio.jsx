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
    const [suggestions, setSuggestions] = useState([]);
    const [inputValue, setInputValue] = useState('');

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
        inputRef.current.focus();
    }, []);

    const fetchPokemonSuggestions = async (input) => {
        if (input.length < 1) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
            const data = await response.json();

            const filteredPokemon = data.results
                .filter(pokemon => 
                    pokemon.name.toLowerCase().startsWith(input.toLowerCase())
                )
                .map(pokemon => pokemon.name);

            setSuggestions(filteredPokemon);
        } catch (error) {
            console.error('Error fetching Pokemon suggestions:', error);
        }
    };

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

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                if (isGuess) {
                    handleNext();
                } else {
                    handleSkip();
                }
            }
            if (e.key === 'Enter') {
                comparator();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGuess]);

    const choosePokemon = () => {
        setIsTransitioning(true);
        setIsGuess(false);
        setShowStats(false);
        setShowVictoryEffect(false);
        setPokemonJson(null);

        let randomId = Math.floor(Math.random() * (152 - 1) + 1);
        fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
            .then((response) => response.json())
            .then((pokemon) => {
                setTimeout(() => {
                    setPokemonJson(pokemon);
                    getSpanishName(randomId);
                    setIsTransitioning(false);
                }, 100);
            })
            .catch((error) => {
                console.error('Error:', error);
                setIsTransitioning(false);
            });
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        fetchPokemonSuggestions(value);
    };

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion);
        inputRef.current.value = suggestion;
        setSuggestions([]);
        comparator(suggestion);
    };

    const comparator = (respuesta) => {
        if (!pokemonJson) return;
        
        const respuestaLimpia = respuesta?.trim().toLowerCase();
        
        if (!respuestaLimpia) return;
    
        if (pokemonJson.name === respuestaLimpia) {
            setIsGuess(true);
            setShowVictoryEffect(true);
            setShowStats(true);
            setScore(prev => prev + 100);
            setStreak(prev => prev + 1);
            inputRef.current.value = "";
        } else {
            setIsError(true);
            inputRef.current.value = "";
            setStreak(0);
            
            setTimeout(() => {
                setIsError(false);
            }, 600);
        }
    };

    const handleNext = () => {
        choosePokemon();
        inputRef.current.value = "";
        setInputValue("");
        inputRef.current.focus();
    };
    
    const handleSkip = () => {
        setStreak(0);
        setScore((prev) => Math.max(0, prev - 50));
        choosePokemon();
        inputRef.current.value = "";
        inputRef.current.focus();
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 
            comparator(inputRef.current.value);
            inputRef.current.focus();
            if (isGuess) {
                handleNext();
            }
        } else if (e.code === 'Space' && !e.repeat) {
            e.preventDefault();
            if (!isGuess) {
                handleSkip();
            }
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
            className="min-h-screen bg-gradient-to-b from-slate-600 to-slate-700 p-8 flex items-center justify-center flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
        <section className="pb-4 text-white rounded shadow-md ">
            <h2 className="text-xl font-bold mb-2 text-center">Cómo jugar</h2>
            <ul>
                <li className="text-sm mb-2">Escribe el nombre del Pokémon en el cuadro de texto y presiona <b>Enter</b> para adivinar.</li>
                <li className="text-sm mb-2">Si no sabes quién es, presiona <b>Espacio</b> para saltar al siguiente Pokémon.</li>
                <li className="text-sm">Cada acierto te da puntos. ¡Acumula una racha para obtener una puntuación más alta!</li>
            </ul>
        </section>

            <motion.div 
            className="bg-red-600 rounded-3xl p-8 w-full max-w-6xl relative overflow-hidden shadow-2xl lg:flex lg:gap-8"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
                backgroundImage: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
            }}
        >
            {/* Pantalla Izquierda */}
            <div className="flex-1 relative bg-red-700 rounded-2xl p-6 shadow-inner">
                
                <div className="absolute top-4 left-4 flex gap-2">
                    <motion.div 
                        className="w-8 h-8 bg-blue-400 rounded-full border-4 border-white"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}
                    />
                    <div className="w-4 h-4 bg-red-300 rounded-full shadow-inner" />
                    <div className="w-4 h-4 bg-yellow-300 rounded-full shadow-inner" />
                    <div className="w-4 h-4 bg-green-300 rounded-full shadow-inner" />
                </div>

                <div className="mt-12">
                    <motion.div 
                        className="text-center mb-6"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl font-bold text-white text-shadow">PokéGuess</h1>
                        <small className='text-red-300'>Primera generación</small>
                        <div className="flex justify-between px-4 text-white">
                            <span>Score: {score}</span>
                            <span>Streak: {streak}</span>
                        </div>
                    </motion.div>

                    
                    <motion.div 
                        className="bg-gray-200 rounded-lg p-4 mb-6 relative border-8 border-gray-700 h-64" 
                        style={{
                            boxShadow: 'inset 0 0 15px rgba(0,0,0,0.3)',
                            background: isGuess 
                                ? 'linear-gradient(135deg, #98FB98 0%, #90EE90 100%)'
                                : 'linear-gradient(135deg, #d1d5db 0%, #e5e7eb 100%)',
                        }}
                    >
                        
                        <AnimatePresence>
                            {isTransitioning && (
                                <motion.div 
                                    className="absolute inset-0 bg-white"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                />
                            )}
                        </AnimatePresence>

                        
                        <div className="relative h-full flex items-center justify-center">
                            {pokemonJson && (
                                <motion.img
                                    src={pokemonJson?.sprites.front_default}
                                    className="w-48 h-48 pixelated"
                                    style={{ 
                                        imageRendering: 'pixelated',
                                    }}
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
                                        duration: isError ? 0.4 : 0.3,
                                        bounce: 0.25,
                                        x: { 
                                            type: "spring", 
                                            stiffness: 300,
                                            damping: 10
                                        }
                                    }}
                                    alt="Pokemon"
                                />
                            )}
                        </div>
                    </motion.div>

                    <div className="space-y-4">
                        <input
                            ref={inputRef}
                            type='text'
                            className="w-full px-4 py-2 rounded-lg border-4 border-gray-700 bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                                boxShadow: 'inset 0 0 8px rgba(0,0,0,0.2)'
                            }}
                            placeholder="¿Quién es este Pokémon?"
                            onChange={handleInputChange}
                            value={inputValue}
                            onKeyDown={handleKeyDown}
                            disabled={!pokemonJson || isTransitioning}
                        />
                        {suggestions.length > 0 && (
                            <ul className="absolute z-10 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                                {suggestions.map((suggestion, index) => (
                                    <li 
                                        key={index}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                    >
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        )}

                        <motion.div 
                            className="bg-[#90EE90] rounded-lg p-4 border-4 border-gray-700 h-[60px] flex items-center justify-center mb-4"
                            style={{
                                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                                background: isError 
                                    ? 'linear-gradient(135deg, #ffcccc 0%, #ff9999 100%)'
                                    : isGuess 
                                        ? 'linear-gradient(135deg, #98FB98 0%, #90EE90 100%)'
                                        : 'linear-gradient(135deg, #90EE90 0%, #98FB98 100%)',
                            }}
                        >
                            <AnimatePresence mode="wait">
                                {isError && (
                                    <motion.div 
                                        className="text-center text-red-800 font-bold"
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
                                        className="text-center font-bold space-y-1 "
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-green-800">
                                            ¡Correcto! Es {pokemonJson.name.toUpperCase()}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        
                        {isGuess ? (
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
                        ) : (
                            <motion.button
                                onClick={handleSkip}
                                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isGuess}
                            >
                                Saltar Pokémon →
                            </motion.button>
                        )}

                        
                    </div>
                    
                </div>
                
            </div>

            <div className='hidden lg:block bg-gray-800 rounded-2xl w-0.5 h-full absolute top-0 left-1/2 z-20'></div>

            {/* Pantalla derecha */}
            <motion.div 
                className="hidden lg:block bg-gray-800 rounded-2xl p-6 flex-1"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                    background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4)'
                }}
            >
                {pokemonJson && showStats && (
                    <div className="text-white">
                        <h2 className="text-2xl font-bold mb-4">Estadísticas del Pokémon</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-700 p-3 rounded-lg">
                                    <span className="text-gray-400">Número:</span>
                                    <p>#{pokemonJson.id.toString().padStart(3, '0')}</p>
                                </div>
                                <div className="bg-gray-700 p-3 rounded-lg">
                                    <span className="text-gray-400">Altura:</span>
                                    <p>{pokemonJson.height / 10} m</p>
                                </div>
                                <div className="bg-gray-700 p-3 rounded-lg">
                                    <span className="text-gray-400">Peso:</span>
                                    <p>{pokemonJson.weight / 10} kg</p>
                                </div>
                                <div className="bg-gray-700 p-3 rounded-lg">
                                    <span className="text-gray-400">Tipos:</span>
                                    <div className="flex gap-2 mt-1">
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


export default PokeGuess;