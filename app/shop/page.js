'use client';
import React, { useState, useEffect } from 'react';
import Layout from "../layout";
import Title from '@/components/Title';
import Link from 'next/link';
import { db, auth } from '@/components/firebaseConfig';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Shop = () => {

    const [shops, setShops] = useState(null);
    const [loadingShops, setLoadingShops] = useState(true);
    const [user, setUser] = useState(null);
    const [recaptchaValidated, setRecaptchaValidated] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const fetchShops = async () => {
                    try {
                        const q = query(collection(db, 'shop'), where('user', '==', currentUser.uid));
                        const querySnapshot = await getDocs(q);
                        const shopsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        setShops(shopsData);
                        setLoadingShops(false);
                    } catch (error) {
                        console.error('Erreur lors de la récupération des annonces:', error);
                    }
                };
                fetchShops();
            }
        });
        return () => unsubscribe();
    }, []);

    const handleAddShopClick = () => {
        if (shops && shops.length >= 3) {
            alert('Vous ne pouvez pas ajouter plus de 3 boutiques.');
        } else {
            router.push('/shop/add');
        }
    };

    return (
        <Layout layoutType="home">
            <Title>Boutiques</Title>
            <div className="container mx-auto px-4 py-8 bg-base-300">
                <div className="mb-6 p-4 bg-base-200 rounded-lg shadow-md flex justify-between items-center">
                    {loadingShops ? (
                        <div className="skeleton h-8 w-full"></div>
                    ) : (
                        <div className="flex justify-between w-full">
                            <button 
                                onClick={handleAddShopClick} 
                                className="btn btn-sm btn-primary"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"></path>
                                </svg>
                                Ajouter une boutique
                            </button>
                        </div>
                    )}
                </div>
                {loadingShops &&
                    <div className="flex justify-center items-center mt-16 mb-10 h-8 w-full">
                        <span className="loading loading-spinner loading-lg text-neutral"></span>
                    </div>
                }

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                    {shops?.map(shop => (
                        <div key={shop.id} className="card bg-base-100 image-full shadow-xl">
                            <figure>
                                <img
                                    src="https://www.jebosseengrandedistribution.fr/content/images/2022/11/10-1.png"
                                    alt="fruits" />
                            </figure>
                            <div className="card-body">
                                <h2 className="card-title">{shop?.nom}</h2>
                                <p>{shop?.adresse}, {shop?.commune}, {shop?.wilaya}</p>
                                <div className="card-actions justify-end">
                                    <Link key={shop.id} href={`/shop/${shop.id}`}>
                                        <button className="btn btn-primary">Modifier</button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout >
    );
};

export default Shop;
