'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, storage, db } from '../components/firebaseConfig';
import { ref, getDownloadURL } from "firebase/storage";
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AddProductModal from './AddProductModal';

export default function MarketPlace({ searchInput, setSearchInput }) {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [statue, setStatue] = useState('offre');
    const [visibleCount, setVisibleCount] = useState(8); // Nombre d'articles visibles initialement
    const [productsList, setProductsList] = useState([]);

    useEffect(() => {
        const fetchProducts = async (category, product, statueProps) => {
            try {
                var querySnapshot = null;
                setLoadingProducts(true);

                if (!category) {
                    const q = query(collection(db, 'listing'), where('statue', '==', statueProps.toString()));
                    querySnapshot = await getDocs(q);
                }
                else {
                    const q = query(collection(db, 'listing'), where('idSelectedCategory', '==', parseInt(category)), where('statue', '==', statueProps.toString()));
                    querySnapshot = await getDocs(q);
                }

                const productsList = await Promise.all(querySnapshot.docs.map(async document => {
                    const data = document.data();

                    // Fetch shop details
                    const shopRef = document.data().shop;
                    const shopDoc = await getDoc(shopRef);
                    const shopData = shopDoc.exists() ? shopDoc.data() : {};

                    // Fetch category label
                    const categoryRef = doc(db, 'parameter-listing', 'category');
                    const categorySnap = await getDoc(categoryRef);
                    const categoryData = categorySnap.exists() ? categorySnap.data().list : [];
                    const categoryLabel = categoryData[data.idSelectedCategory] || "";

                    // Fetch product label
                    const productRef = doc(db, 'parameter-listing', 'product');
                    const productSnap = await getDoc(productRef);
                    const productData = productSnap.exists() ? productSnap.data().list : [];
                    const productLabel = productData.find(p => p.category === data.idSelectedCategory && p.id === data.idSelectedProduct)?.libelle || "";

                    const imgRef = ref(storage, 'listing/' + document.id + '/picture.jpg');
                    const imageUrl = await getDownloadURL(imgRef).catch(() => '');
                    return { id: document.id, ...data, shop: shopData, imageUrl, categoryLabel, productLabel };
                }));

                setProducts(productsList.filter(product => product !== null));
                setLoadingProducts(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des annonces:', error);
            }
        };

        const fetchProductTypes = async () => {
            try {
                const docRef = doc(db, 'parameter-listing', 'category');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const typesList = docSnap.data().list;
                    setProductTypes(typesList);
                } else {
                    console.log("No such document!");
                }
                setLoadingCategories(false);
            } catch (error) {
                console.error('Erreur lors de la récupération des types de produits:', error);
            }
        };

        fetchProducts(selectedCategory, selectedProduct, statue);
        fetchProductTypes();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, [selectedCategory, selectedProduct, statue, searchInput]);

    useEffect(() => {
        if (!loadingProducts && searchInput) {
            setLoadingProducts(true);
            const filteredProducts = products.filter(product => {
                const searchText = searchInput.toLowerCase();
                const matchesCategory = selectedCategory ? product.idSelectedCategory === parseInt(selectedCategory) : true;
                const matchesProduct = selectedProduct ? product.idSelectedProduct === parseInt(selectedProduct) : true;
                const matchesStatue = product.statue === statue;
                const matchesSearchText = 
                    product.titre.toLowerCase().includes(searchText) ||
                    product.description.toLowerCase().includes(searchText) ||
                    product.shop.nom.toLowerCase().includes(searchText) ||
                    product.categoryLabel.toLowerCase().includes(searchText) ||
                    product.productLabel.toLowerCase().includes(searchText);
                return matchesCategory && matchesProduct && matchesStatue && matchesSearchText;
            });
            setProducts(filteredProducts);
            setLoadingProducts(false);
        }
    }, [searchInput, products]);

    const handleMouseEnter = (productId) => {
        setHoveredProduct(productId);
    };

    const handleMouseLeave = () => {
        setHoveredProduct(null);
    };

    const truncateDescription = (description) => {
        const maxLength = 50;
        if (description.length > maxLength) {
            return description.slice(0, maxLength) + '...';
        }
        return description;
    };

    const truncateTitle = (titre) => {
        const maxLength = 25;
        if (titre.length > maxLength) {
            return titre.slice(0, maxLength) + '...';
        }
        return titre;
    };


    const handleAddProductClick = () => {
        if (user) {
            document.getElementById('add-product-modal').showModal();
        } else {
            router.push('/login');
        }
    };

    const handleCategoryChange = (event) => {
        const category = event.target.value;
        setSelectedCategory(category);
        setSelectedProduct(''); // Réinitialiser le produit sélectionné lors du changement de catégorie
    };

    const handleProductChange = (event) => {
        const product = event.target.value;
        setSelectedProduct(product);
    };

    const handleShowMore = () => {
        setVisibleCount(prevCount => prevCount + 2); // Augmente le nombre d'articles visibles de 2
    };

    const displayedProducts = products.slice(0, visibleCount);

    return (
        <div className="mx-auto px-4 py-8 bg-[url('../app/background-white.jpg')] bg-repeat bg-contain">
            <div className="mb-6 p-4 bg-base-100 rounded-lg shadow-md flex justify-between items-center">
                {loadingCategories ? (
                    <div className="skeleton h-8 w-full"></div>
                ) : (
                    <div className="flex justify-between w-full">
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            className="select select-bordered w-full max-w-xs"
                        >
                            <option value="">Tout</option>
                            {productTypes.map((type, index) => (
                                <option key={index} value={index}>{type}</option>
                            ))}
                        </select>
                        <div className="flex items-center">
                            <div className="form-control mr-4">
                                <label className="label cursor-pointer">
                                    <input type="radio" name="radio-10" className="radio checked:bg-neutral mr-2" defaultChecked onChange={() => setStatue("offre")} />
                                    <span className="label-text">Offre</span>
                                </label>
                            </div>
                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <input type="radio" name="radio-10" className="radio checked:bg-neutral mr-2" onChange={() => setStatue("demande")} />
                                    <span className="label-text">Demande</span>
                                </label>
                            </div>
                        </div>
                        <button className="btn btn-primary" onClick={handleAddProductClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M11 13H6q-.425 0-.712-.288T5 12t.288-.712T6 11h5V6q0-.425.288-.712T12 5t.713.288T13 6v5h5q.425 0 .713.288T19 12t-.288.713T18 13h-5v5q0 .425-.288.713T12 19t-.712-.288T11 18z"></path>
                            </svg>
                            Ajouter un article
                        </button>
                    </div>
                )}
            </div>

            {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="skeleton h-96 w-full"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {displayedProducts.map(product => (
                        <Link key={product.id} href={`/listing/${product.id}`}>
                            <div
                                className={`relative card card-compact ${hoveredProduct === product.id ? 'bg-base-300' : 'bg-base-200'} shadow-xl cursor-pointer`}
                                onMouseEnter={() => handleMouseEnter(product.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <figure className="h-48 overflow-hidden">
                                    <img src={product.imageUrl || ""} alt={product.titre} className="w-full h-full object-cover" />
                                </figure>
                                <div className="absolute top-2 right-2">
                                    <p className="text-lg font-semibold bg-base-100 px-4 py-2 rounded-md">{product.prix} Dzd</p>
                                </div>
                                <div className="card-body p-4">
                                    <h2 className="card-title text-lg font-semibold mb-2">{truncateDescription(product.titre)}</h2>
                                    <p className="text-gray-600"><strong>{product.shop.wilaya}</strong> | {truncateDescription(product.description)}</p>
                                    <div className="flex items-center text-gray-500 mt-2">
                                        {product.productLabel && <span className="mr-2 badge">{product.productLabel}</span>}
                                        {product.categoryLabel && <span className="mr-2 badge">{product.categoryLabel}</span>}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mt-2">
                                        <p className="flex items-center mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="mr-1">
                                                <path fill="currentColor" d="M5 22q-.825 0-1.412-.587T3 20V6q0-.825.588-1.412T5 4h1V2h2v2h8V2h2v2h1q.825 0 1.413.588T21 6v4.675q0 .425-.288.713t-.712.287t-.712-.288t-.288-.712V10H5v10h5.8q.425 0 .713.288T11.8 21t-.288.713T10.8 22zm13 1q-2.075 0-3.537-1.463T13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23m1.675-2.625l.7-.7L18.5 17.8V15h-1v3.2z"></path>
                                            </svg>
                                            {product.date?.toDate().toLocaleDateString()}
                                        </p>
                                        <p className="flex items-center mr-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="mr-1">
                                                <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3s3-1.34 3-3s-1.34-3-3-3"></path>
                                            </svg>
                                            {product.vue}
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" className="mr-1"><path fill="currentColor" d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2c1.31 0 2.393-.764 2.552-1.75M10 9c1.42 0 2.571-.896 2.571-2c0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875A2.527 2.527 0 0 0 7.429 7c0 1.104 1.151 2 2.571 2m5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248c-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046M18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9C17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5"></path></svg>
                                            {product.shop.nom}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            {products.length > visibleCount && !loadingProducts && (
                    <button className="btn btn-primary btn-block" onClick={handleShowMore}>Afficher plus</button>
            )}
            <AddProductModal user={user} />
        </div>
    );
}