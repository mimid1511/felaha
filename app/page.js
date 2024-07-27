"use client"

import Layout from "./layout";
import Hero from "@/components/Hero";
import MarketPlace from "@/components/MarketPlace";
import { useState } from "react";

export default function Home() {

  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (input) => {
    setSearchInput(input);
  };

  return (
    <Layout layoutType="home">
      <Hero onSearchSubmit={handleSearchSubmit} />
      <MarketPlace searchInput={searchInput} setSearchInput={setSearchInput} />
    </Layout>
  );
}

// Faire la pagination des articles + gors jeux de tests
// Faire fonctionner les search bar
// Faire toute les redirections pour les pages ou l'on doit etre logé

// ---- Facultatif -------------------------------------------------------------
// Rajouter un Recaptcha pour l'add de annonces
// Crer une page parametre qui serait + un menu qui vient sur la gauche (option exemple , theme sombre)
// Ameliorer le code en se séparant des styles et passer en full TaylwindCSS
// Faire les page evenements et actualités