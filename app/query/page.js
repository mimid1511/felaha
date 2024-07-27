"use client";

import React from 'react';
import { db } from "@/components/firebaseConfig";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";

const produitsLaitiers = [
    { libelle: 'Lait de vache', category: 6 },
    { libelle: 'Lait de chèvre', category: 6 },
    { libelle: 'Lait de brebis', category: 6 },
    { libelle: 'Beurre', category: 6 },
    { libelle: 'Fromage', category: 6 },
    { libelle: 'Yaourt', category: 6 },
    { libelle: 'Babeurre', category: 6 },
    { libelle: 'Crème fraîche', category: 6 },
    { libelle: 'Végétaline', category: 6 }
];

const addProduitsLaitiersToList = async () => {
    try {
        // Ajout des produits laitiers
        for (const produit of produitsLaitiers) {
            await updateDoc(doc(db, 'parameter-listing', 'product'), {
                list: arrayUnion({
                    libelle: produit.libelle,
                    category: produit.category,
                })
            });
            console.log(`Produit ${produit.libelle} ajouté à la liste avec succès!`);
        }

        console.log('Tous les produits laitiers ont été ajoutés à la liste avec succès!');
    } catch (error) {
        console.error('Erreur lors de l\'ajout des produits laitiers à la liste:', error);
    }
};

export default function AddProduitsLaitiersToListPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">Ajouter les produits laitiers à la liste</h1>
            <button
                className="btn btn-primary"
                onClick={addProduitsLaitiersToList}
            >
                Ajouter à la liste
            </button>
        </div>
    );
}
