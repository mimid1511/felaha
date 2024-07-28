'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/app/layout';
import Title from '@/components/Title';
import { auth, storage, db } from '@/components/firebaseConfig';
import { ref, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import ReCAPTCHA from 'react-google-recaptcha';
import MapFindPlaceRender from '@/components/MapFindPlaceRender';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Listing = ({ params }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [listing, setListing] = useState(null);
    const [recaptchaValidated, setRecaptchaValidated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            const docRef = doc(db, 'listing', params.id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const listingData = docSnap.data();

                // Fetch shop details
                const shopRef = listingData.shop;
                const shopDoc = await getDoc(shopRef);
                const shopData = shopDoc.exists() ? shopDoc.data() : {};
                listingData.shop = shopData;

                // Fetch category detail
                const imgRef = ref(storage, 'listing/' + docSnap.id + '/picture.jpg');
                const imageUrl = await getDownloadURL(imgRef).catch(() => '');
                listingData.image = imageUrl;

                // Fetch category label
                const categoryRef = doc(db, 'parameter-listing', 'category');
                const categorySnap = await getDoc(categoryRef);
                const categoryData = categorySnap.exists() ? categorySnap.data().list : [];
                listingData.categoryLabel = categoryData[listingData.idSelectedCategory] || "";

                // Fetch product label
                const productRef = doc(db, 'parameter-listing', 'product');
                const productSnap = await getDoc(productRef);
                const productData = productSnap.exists() ? productSnap.data().list : [];
                listingData.productLabel = productData[listingData.idSelectedProduct] ? productData[listingData.idSelectedProduct].libelle : "";

                setListing(listingData);
            } else {
                console.log("No such document!");
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [params.id, router]);

    return (
        <Layout layoutType="home">
            <Title>{listing?.titre}</Title>
            <div className="p-4 bg-base-300">
                <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
                    {listing ? (
                        <>
                            <div className="mb-8">
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <p className="flex items-center mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="mr-1">
                                            <path fill="currentColor" d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v4.675q0 .425-.288.713t-.712.287t-.712-.288t-.288-.712V10H5v10h5.8q.425 0 .713.288T11.8 21t-.288.713T10.8 22zm13 1q-2.075 0-3.537-1.463T13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23m1.675-2.625l.7-.7L18.5 17.8V15h-1v3.2z"></path>
                                        </svg>
                                        {listing?.date.toDate().toLocaleDateString()}
                                    </p>
                                    <p className="flex items-center mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="mr-1">
                                            <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3"></path>
                                        </svg>
                                        {listing.vue}
                                    </p>
                                    <p className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="mr-1">
                                            <path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"></path>
                                        </svg>
                                        {listing.user.nom}
                                    </p>
                                    <p className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" className="mr-1"><path fill="currentColor" d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2c1.31 0 2.393-.764 2.552-1.75M10 9c1.42 0 2.571-.896 2.571-2c0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875A2.527 2.527 0 0 0 7.429 7c0 1.104 1.151 2 2.571 2m5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248c-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046M18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9C17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5"></path></svg>
                                        {listing.shop.nom}
                                    </p>
                                </div>
                                <div className="flex items-center text-gray-500 mb-4">
                                    {listing.categoryLabel && <span className="mr-2 badge">{listing.categoryLabel}</span>}
                                    {listing.productLabel && <span className="mr-2 badge">{listing.productLabel}</span>}
                                </div>
                                <div className="flex justify-center mb-6">
                                    <img
                                        src={listing?.image || ""}
                                        alt={listing?.titre}
                                        className="w-full h-64 object-cover rounded-lg shadow-md"
                                    />
                                </div>
                                <p className="mb-4"><strong>Description : </strong>{listing?.description}</p>
                                <div className="stats stats-vertical lg:stats-horizontal shadow mb-4">
                                    <div className="stat">
                                        <div className="stat-title">Statue</div>
                                        <div className="stat-value">{listing?.statue}</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Prix</div>
                                        <div className="stat-value">{listing?.prix} DZD</div>
                                    </div>
                                    <div className="stat">
                                        <div className="stat-title">Unité</div>
                                        <div className="stat-value">{listing?.unite}</div>
                                    </div>
                                </div>
                                <div className="collapse bg-base-100 mb-6">
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-medium">Détail</div>
                                    <div className="collapse-content">
                                        {(listing.idSelectedCategory == 0 || listing.idSelectedCategory == 1 || listing.idSelectedCategory == 2) &&
                                            <div className="overflow-x-auto">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Hectare</th>
                                                            <th>En vrac</th>
                                                            <th>Récolté</th>
                                                            <th>Date de récolte</th>
                                                            <th>Quantité (Kg ou L)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{listing?.hectare}</td>
                                                            <td>{listing?.isBulk ? "✓" : "✗"}</td>
                                                            <td>{listing?.isHarvested ? "✓" : "✗"}</td>
                                                            <td>{listing?.harvestDate.toDate().toLocaleDateString()}</td>
                                                            <td>{listing?.quantity}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                        {(listing.idSelectedCategory == 3) &&
                                            <div className="overflow-x-auto">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Nombre de tête</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{listing?.newHeadsNumber}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                        {(listing.idSelectedCategory == 4 || listing.idSelectedCategory == 5 || listing.idSelectedCategory == 6) &&
                                            <div className="overflow-x-auto">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Quantité (Kg ou L)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{listing?.quantity}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                        {(listing.idSelectedCategory == 7) &&
                                            <div className="overflow-x-auto">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Quantité (Kg ou L)</th>
                                                            <th>Capacité en tonnes</th>
                                                            <th>Portée (Km)</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{listing?.quantity}</td>
                                                            <td>{listing?.newCapacity}</td>
                                                            <td>{listing?.newScope}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                        {(listing.idSelectedCategory == 8) &&
                                            <div className="overflow-x-auto">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Quantité (Kg ou L)</th>
                                                            <th>Capacité en tonnes</th>
                                                            <th>Nombre de chambres</th>
                                                            <th>Min température</th>
                                                            <th>Max température</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr>
                                                            <td>{listing?.quantity}</td>
                                                            <td>{listing?.newCapacity}</td>
                                                            <td>{listing?.newRoomNumber}</td>
                                                            <td>{listing?.newMinT}</td>
                                                            <td>{listing?.newMaxT}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <p className="mb-4"><strong>Adresse : </strong>{listing?.shop.adresse}, {listing?.shop.commune}, {listing?.shop.wilaya}.</p>
                                <p className="mb-4"><strong>Téléphone : </strong>{listing?.shop.phone}</p>
                                <p className="mb-1"><strong>Note de la boutique</strong></p>
                                <div className="rating mb-8">
                                    <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
                                    <input
                                        type="radio"
                                        name="rating-2"
                                        className="mask mask-star-2 bg-orange-400"
                                        defaultChecked />
                                    <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
                                    <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
                                    <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
                                </div>
                                <br />
                                <div className="join join-vertical lg:join-horizontal">
                                    <button onClick={() => router.push("https://www.google.com/maps/dir//" + listing.shop.location.latitude + "," + listing.shop.location.longitude)} className="btn btn-info join-item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} color="currentColor"><path d="M10.08 2C5.47 2.936 2 7.012 2 11.899C2 17.478 6.522 22 12.101 22c4.887 0 8.963-3.47 9.899-8.08"></path><path d="M18.938 18A3.8 3.8 0 0 0 20 17.603m-5.312-.262q.895.39 1.717.58m-5.55-2.973c.413.29.855.638 1.285.938M3 13.826c.322-.157.67-.338 1.063-.493M6.45 13c.562.062 1.192.223 1.906.523M18 7.5a1.5 1.5 0 1 0-3 0a1.5 1.5 0 0 0 3 0"></path><path d="M17.488 13.62a1.46 1.46 0 0 1-.988.38a1.46 1.46 0 0 1-.988-.38c-2.427-2.244-5.679-4.752-4.093-8.392C12.277 3.259 14.335 2 16.5 2s4.223 1.26 5.08 3.228c1.585 3.636-1.66 6.155-4.092 8.392"></path></g></svg> Itiniraire GPS</button>
                                    <a href={`tel:${listing.shop.phone}`} className="btn btn-primary join-item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4.05 21q-.45 0-.75-.3t-.3-.75V15.9q0-.325.225-.587t.575-.363l3.45-.7q.35-.05.713.063t.587.337L10.9 17q.95-.55 1.8-1.213t1.625-1.437q.825-.8 1.513-1.662t1.187-1.788L14.6 8.45q-.2-.2-.275-.475T14.3 7.3l.65-3.5q.05-.325.325-.562T15.9 3h4.05q.45 0 .75.3t.3.75q0 3.125-1.362 6.175t-3.863 5.55t-5.55 3.863T4.05 21"></path></svg>Téléphoner</a>
                                    <button onClick={() => router.push("/message/" + listing.user)} className="btn btn-secondary join-item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-2 12H6v-2h12zm0-3H6V9h12zm0-3H6V6h12z"></path></svg>Messages</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Listing;
