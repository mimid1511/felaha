'use client';
import React, { useState, useEffect } from 'react';
import Layout from '@/app/layout';
import Title from '@/components/Title';
import { db, auth } from '@/components/firebaseConfig';
import { collection, setDoc, doc, GeoPoint, query, where, getDocs } from "firebase/firestore";
import ReCAPTCHA from 'react-google-recaptcha';
import MapFindPlaceRender from '@/components/MapFindPlaceRender';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const AddShop = () => {
    const router = useRouter();
    const [recaptchaValidated, setRecaptchaValidated] = useState(false);
    const [wilaya, setWilaya] = useState("");
    const [commune, setCommune] = useState("");
    const [adresse, setAdresse] = useState("");
    const [phone, setPhone] = useState("");
    const [nom, setNom] = useState(""); // Added state for nom
    const [loading, setLoading] = useState(false);
    const [manualMarkerPosition, setManualMarkerPosition] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Check if user has less than 3 shops
                    const q = query(collection(db, 'shop'), where('user', '==', currentUser.uid));
                    const querySnapshot = await getDocs(q);
                    const shopsCount = querySnapshot.size;

                    if (shopsCount >= 3) {
                        router.push('/shop'); // Redirect if user already has 3 shops
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification des boutiques:', error);
                }
            } else {
                router.push('/login'); // Redirect if user is not logged in
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [router]);

    const handleRecaptchaChange = (value) => {
        setRecaptchaValidated(!!value);
    };

    const handleSubmit = async () => {
        if (!nom || !wilaya || !commune || !adresse || !manualMarkerPosition || !phone) {
            alert("Veuillez remplir tous les champs.");
            return;
        }

        setLoading(true);
        try {
            const currentUser = auth.currentUser;

            if (currentUser) {
                // Document data
                const data = {
                    nom,
                    wilaya,
                    commune,
                    adresse,
                    phone,
                    user: currentUser.uid,
                    location: new GeoPoint(manualMarkerPosition.lat, manualMarkerPosition.lng)
                };

                // Create a new document in the "shop" collection
                await setDoc(doc(collection(db, "shop")), data);
                router.push("/shop");
            } else {
                alert("Utilisateur non connecté.");
                router.push('/login');
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la boutique : ", error);
            alert("Erreur lors de l'ajout de la boutique.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout layoutType="home">
            <Title>Ajouter une nouvelle boutique</Title>
            <div className="p-8 bg-[url('../app/background-dark.jpg')] bg-repeat bg-contain">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
                    <MapFindPlaceRender
                        wilaya={wilaya}
                        setWilaya={setWilaya}
                        commune={commune}
                        setCommune={setCommune}
                        adresse={adresse}
                        setAdresse={setAdresse}
                        manualMarkerPosition={manualMarkerPosition}
                        setManualMarkerPosition={setManualMarkerPosition}
                    />

                    <div className="divider"></div>

                    <input
                        type="text"
                        placeholder="Nom"
                        className="input input-bordered w-full mb-4"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                    />

                    <input
                        type="tel"
                        placeholder="Téléphone"
                        className="input input-bordered w-full mb-4"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />


                    <ReCAPTCHA
                        className='mb-4'
                        sitekey="6LeUTxUqAAAAAD9QsWtDW-DBjJcWcwnoBwKmQvny"
                        onChange={handleRecaptchaChange}
                    />

                    <button
                        onClick={handleSubmit}
                        className="btn btn-primary btn-wide w-full"
                        disabled={!recaptchaValidated || loading}
                    >
                        {loading ? "Ajout en cours..." : "Ajouter"}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default AddShop;
