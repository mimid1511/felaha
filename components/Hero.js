'use client';

import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

export default function Hero({ onSearchSubmit }) {
    const [wilayas, setWilayas] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    useEffect(() => {
        const fetchWilayas = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "wilaya"));
                const wilayasList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setWilayas(wilayasList);
            } catch (error) {
                console.error("Erreur lors de la récupération des wilayas:", error);
            }
        };

        fetchWilayas();
    }, []);

    const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleSearchClick = () => {
        setHasSearched(true);
        onSearchSubmit(searchInput);
        setSearchInput("");
    };

    const resetSearchClick = () => {
        setSearchInput('');
        setHasSearched(false);
        onSearchSubmit('');
    };

    return (
        <div className="hero h-44 bg-[url('../app/background-hero.jpg')] bg-cover">
            <div className="hero-overlay bg-opacity-60"></div>
            <div className="hero-content text-center">
                <div className="max-w-md">
                    <select className="select select-bordered select-sm w-full max-w-xs mb-5" defaultValue="">
                        <option value="" disabled>Wilaya</option>
                        {wilayas.map((wilaya) => (
                            <option key={wilaya.id} value={wilaya.id}>{`${wilaya.id} - ${wilaya.libelle}`}</option>
                        ))}
                    </select>
                    {!hasSearched &&
                        <div className="join">
                            <input
                                className="input text-black input-bordered join-item w-full md:w-3/4 lg:w-1/2"
                                placeholder="Rechercher un produit, un producteur..."
                                value={searchInput}
                                onChange={handleSearchInputChange}
                            />
                            <button className="btn join-item rounded-r-full" onClick={handleSearchClick}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                                    <path fill="currentColor" fillRule="evenodd" d="M14.385 15.446a6.75 6.75 0 1 1 1.06-1.06l5.156 5.155a.75.75 0 1 1-1.06 1.06zm-7.926-1.562a5.25 5.25 0 1 1 7.43-.005l-.005.005l-.005.004a5.25 5.25 0 0 1-7.42-.004" clipRule="evenodd"></path>
                                </svg>
                            </button>
                        </div>
                    }
                    {hasSearched &&
                        <button className="btn btn-error" onClick={resetSearchClick}>
                            Réinitialiser
                        </button>
                    }

                </div>
            </div>
        </div>
    );
}
