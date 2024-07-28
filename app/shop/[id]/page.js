'use client';
import React, { useState, useEffect } from 'react';
import Layout from '@/app/layout';
import Title from '@/components/Title';
import { db, auth } from '@/components/firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc, GeoPoint } from "firebase/firestore";
import ReCAPTCHA from 'react-google-recaptcha';
import MapFindPlaceRender from '@/components/MapFindPlaceRender';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const EditShop = ({ params }) => {
    const router = useRouter();
    const [recaptchaValidated, setRecaptchaValidated] = useState(false);
    const [wilaya, setWilaya] = useState("");
    const [commune, setCommune] = useState("");
    const [adresse, setAdresse] = useState("");
    const [nom, setNom] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);
    const [manualMarkerPosition, setManualMarkerPosition] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                router.push('/login'); // Redirect if user is not logged in
                return;
            }

            console.log(params.id);

            try {
                const shopDoc = await getDoc(doc(db, "shop", params.id));
                if (shopDoc.exists()) {
                    const shopData = shopDoc.data();
                    setNom(shopData.nom);
                    setWilaya(shopData.wilaya);
                    setCommune(shopData.commune);
                    setAdresse(shopData.adresse);
                    setPhone(shopData.phone);
                    setManualMarkerPosition({
                        lat: shopData.location.latitude,
                        lng: shopData.location.longitude
                    });
                } else {
                    alert("La boutique n'existe pas.");
                    router.push('/shop');
                }
            } catch (error) {
                console.error("Erreur lors de la récupération de la boutique : ", error);
                alert("Erreur lors de la récupération de la boutique.");
            }
        });
        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [params.id, router]);

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
            const currentUser = user;

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

                // Update the existing document in the "shop" collection
                await updateDoc(doc(db, "shop", params.id), data);
                router.push("/shop");
            } else {
                alert("Utilisateur non connecté.");
                router.push('/login');
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la boutique : ", error);
            alert("Erreur lors de la mise à jour de la boutique.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment supprimer cette boutique ?")) {
            return;
        }

        setLoading(true);
        try {
            const currentUser = user;

            if (currentUser) {
                // Delete the document in the "shop" collection
                await deleteDoc(doc(db, "shop", params.id));
                router.push("/shop");
            } else {
                alert("Utilisateur non connecté.");
                router.push('/login');
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la boutique : ", error);
            alert("Erreur lors de la suppression de la boutique.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout layoutType="home">
            <Title>{nom}</Title>
            <div className="p-8 bg-base-300">
                <div className="bg-base-100 p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
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
                        className="btn btn-primary btn-wide w-full mb-4"
                        disabled={!recaptchaValidated || loading}
                    >
                        {loading ? "Mise à jour en cours..." : "Mettre à jour"}
                    </button>

                    <button
                        onClick={handleDelete}
                        className="btn btn-error btn-wide w-full"
                        disabled={!recaptchaValidated || loading}
                    >
                        {loading ? "Suppression en cours..." : "Supprimer"}
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default EditShop;
