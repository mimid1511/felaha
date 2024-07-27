import React, { useState, useEffect } from 'react';
import { db, storage } from './firebaseConfig';
import { collection, addDoc, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { ref, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import { auth } from './firebaseConfig';
import Image from 'next/image';

export default function AddProductModal({user}) {
    const [statue, setStatue] = useState('offre');
    const [newProductTitle, setNewProductTitle] = useState('');
    const [newProductDescription, setNewProductDescription] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductUnite, setNewProductUnite] = useState('');
    const [newProductHectare, setNewProductHectare] = useState('');
    const [newProductHarvestDate, setNewProductHarvestDate] = useState('');
    const [newProductQuantity, setNewProductQuantity] = useState('');
    const [newMaxT, setNewMaxT] = useState('');
    const [newMinT, setNewMinT] = useState('');
    const [newHeadsNumber, setNewHeadsNumber] = useState('');
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newScope, setNewScope] = useState('');
    const [newCapacity, setNewCapacity] = useState('');
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [shops, setShops] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedShop, setSelectedShop] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [newImage, setNewImage] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [isBulk, setIsBulk] = useState(false);
    const [isHarvested, setIsHarvested] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');
    const [isNextDisabledStep1, setIsNextDisabledStep1] = useState(true);
    const [isNextDisabledStep2, setIsNextDisabledStep2] = useState(true);
    const [isNextDisabledStep3, setIsNextDisabledStep3] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const docRef = doc(db, 'parameter-listing', 'category');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCategories(data.list);
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des catégories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedCategory) return;
            try {
                const docRef = doc(db, 'parameter-listing', 'product');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const filteredProducts = data.list.filter(product => product.category === parseInt(selectedCategory));
                    setProducts(filteredProducts);
                    setSelectedProduct('');
                } else {
                    console.error('No such document!');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des produits:', error);
            }
        };
        fetchProducts();
    }, [selectedCategory]);

    useEffect(() => {
        const fetchShops = async () => {
            const user = auth.currentUser;
            if (user) {
                const q = query(collection(db, 'shop'), where('user', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const userShops = [];
                querySnapshot.forEach((doc) => {
                    userShops.push({ id: doc.id, ...doc.data() });
                });
                setShops(userShops);
            }
        };

        fetchShops();
    }, [auth.currentUser]);

    const validateStep1 = () => {
        if (!selectedCategory) {
            return false;
        }

        const category = parseInt(selectedCategory);
        const isCategoryValid = {
            '0': () => newProductHectare && newProductHarvestDate && newProductQuantity && selectedProduct,
            '1': () => newProductHectare && newProductHarvestDate && newProductQuantity && selectedProduct,
            '2': () => newProductHectare && newProductHarvestDate && newProductQuantity && selectedProduct,
            '3': () => newHeadsNumber && selectedProduct,
            '4': () => newProductQuantity,
            '5': () => newProductQuantity,
            '6': () => newProductQuantity && selectedProduct,
            '7': () => newCapacity && newScope,
            '8': () => newCapacity && newMinT && newMaxT && newRoomNumber,
        };

        return isCategoryValid[category] ? isCategoryValid[category]() : false;
    };

    const validateStep2 = () => {
        if (selectedShop && newProductTitle && newProductDescription && newProductUnite && newProductPrice) {
            return true;
        }
        else { return false; }
    };

    const validateStep3 = () => {
        if (selectedImage) {
            return true;
        }
        else { return false; }
    };

    useEffect(() => {
        setIsNextDisabledStep1(!validateStep1());
    }, [
        selectedCategory,
        selectedProduct,
        newProductHectare,
        newProductHarvestDate,
        newProductQuantity,
        newHeadsNumber,
        newCapacity,
        newScope,
        newRoomNumber,
        newMinT,
        newMaxT
    ]);

    useEffect(() => {
        setIsNextDisabledStep2(!validateStep2());
    }, [
        selectedShop,
        newProductTitle,
        newProductPrice,
        newProductUnite,
        newProductDescription,
    ]);

    useEffect(() => {
        setIsNextDisabledStep3(!validateStep3());
    }, [
        selectedImage,
    ]);


    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setNewImage(e.target.files[0]);
            const reader = new FileReader();
            reader.onload = (event) => {
                setSelectedImage(event.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleImageDelete = () => {
        setSelectedImage('');
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();

        try {
            const newProduct = {
                titre: newProductTitle ? newProductTitle : null,
                description: newProductDescription ? newProductDescription : null,
                prix: newProductPrice ? parseFloat(newProductPrice) : null,
                hectare: newProductHectare ? parseInt(newProductHectare) : null,
                harvestDate: newProductHarvestDate ? Timestamp.fromDate(new Date(Date.parse(newProductHarvestDate))) : null,
                quantity: newProductQuantity ? parseFloat(newProductQuantity) : null,
                unite :  newProductUnite ? parseInt(newProductUnite) : null,
                newMaxT : newMaxT ? parseInt(newMaxT) : null,
                newMinT : newMinT ? parseInt(newMinT) : null,
                newHeadsNumber : newHeadsNumber ? parseInt(newHeadsNumber) : null,
                newRoomNumber : newRoomNumber ? parseInt(newRoomNumber) : null,
                newScope : newScope ? parseFloat(newScope) : null,
                newCapacity : newCapacity ? parseFloat(newCapacity) : null,
                idSelectedCategory : selectedCategory ? parseInt(selectedCategory) : null,
                shop : selectedShop ? doc(db, "shop", selectedShop) : null,
                idSelectedProduct : selectedProduct ? parseInt(selectedProduct) : null,
                isBulk : isBulk ? isBulk : false,
                isHarvested : isHarvested ? isHarvested : false,
                vue : 0,
                date : Timestamp.fromDate(new Date()),
                user : user.uid,
                statue : statue ? statue : "offre",
            };

            const data = await addDoc(collection(db, 'listing'), newProduct);

            if (selectedImage) {
                const imgProfilePicture = ref(storage, 'listing/' + data.id + '/picture.jpg');
                await uploadBytes(imgProfilePicture, newImage);
            }
    
            setNewProductTitle('');
            setNewProductDescription('');
            setNewProductPrice('');
            setNewProductHectare('');
            setNewProductHarvestDate('');
            setNewProductQuantity('');
            document.getElementById('add-product-modal').close();
            window.location.reload();
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit:', error);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    return (
        <dialog id="add-product-modal" className="modal">
            <div className="modal-box bg-white w-11/12 max-w-2xl">
                <form method="dialog">
                    <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                </form>
                <h2 className="font-bold text-2xl text-center">Ajouter un nouvel article</h2>
                <form className="py-4" onSubmit={handleAddProduct}>
                    <div className="flex justify-center mt-4 mb-8">
                        <ul className="steps steps-vertical lg:steps-horizontal">
                            <li className={`step ${currentStep >= 1 ? 'step-primary' : ''} ${currentStep === 1 ? 'font-bold' : ''}`}>Détails</li>
                            <li className={`step ${currentStep >= 2 ? 'step-primary' : ''} ${currentStep === 2 ? 'font-bold' : ''}`}>Description</li>
                            <li className={`step ${currentStep >= 3 ? 'step-primary' : ''} ${currentStep === 3 ? 'font-bold' : ''}`}>Image</li>
                            <li className={`step ${currentStep >= 4 ? 'step-primary' : ''} ${currentStep === 4 ? 'font-bold' : ''}`}>Publier</li>
                        </ul>
                    </div>

                    {currentStep === 1 && (
                        <div className="form-control">
                            <div className="mb-4 flex items-center">
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
                            <div className="flex justify-center mb-5">
                                <select
                                    className="select select-bordered w-1/2 md:mr-2 select-sm"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    required
                                >
                                    <option disabled value="">Catégorie</option>
                                    {categories.map((category, key) => (
                                        <option key={key} value={key}>{category}</option>
                                    ))}
                                </select>
                                <select
                                    className="select select-bordered w-1/2 md:ml-2 select-sm"
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    disabled={!selectedCategory || products.length === 0}
                                    required
                                >
                                    <option disabled value="">Produit</option>
                                    {products.map((product, key) => (
                                        <option key={key} value={key}>{product.libelle}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-center mb-2">
                                <input
                                    type="number"
                                    placeholder='Héctare' min="0" max="10000"
                                    className="input input-bordered w-full input-sm"
                                    value={newProductHectare}
                                    disabled={!['0', '1', '2'].includes(selectedCategory)}
                                    onChange={(e) => setNewProductHectare(e.target.value)}
                                    required
                                />
                                <div className="flex justify-between">
                                    <div className="form-control w-28 mr-2 ml-4">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">En vrac</span>
                                            <input
                                                type="checkbox"
                                                className="toggle"
                                                checked={isBulk}
                                                onChange={() => setIsBulk(!isBulk)}
                                                disabled={!['0', '1', '2'].includes(selectedCategory)}
                                            />
                                        </label>
                                    </div>
                                    <div className="form-control w-28">
                                        <label className="label cursor-pointer">
                                            <span className="label-text">Récolté</span>
                                            <input
                                                type="checkbox"
                                                className="toggle"
                                                checked={isHarvested}
                                                onChange={() => setIsHarvested(!isHarvested)}
                                                disabled={!['0', '1', '2'].includes(selectedCategory)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-center mb-4">
                                <label className="flex flex-col w-1/2 md:mr-2">
                                    <span className="label-text mb-2">Date de récolte</span>
                                    <input
                                        type="date"
                                        className="input input-bordered input-sm"
                                        value={newProductHarvestDate}
                                        onChange={(e) => setNewProductHarvestDate(e.target.value)}
                                        required disabled={!['0', '1', '2'].includes(selectedCategory)}
                                    />
                                </label>
                                <input
                                    type="number"
                                    placeholder='Quantité (Kg ou L)'
                                    className="input input-bordered w-1/2 mt-7 md:ml-2 input-sm"
                                    value={newProductQuantity} min="0.1" max="10000" step={0.1}
                                    onChange={(e) => setNewProductQuantity(e.target.value)}
                                    required disabled={!['0', '1', '2', '4', '5', '6', '8', '7'].includes(selectedCategory)}
                                />
                            </div>
                            <div className="flex justify-center mb-4">
                                <input
                                    type="number"
                                    placeholder='Capacité en tonnes'
                                    className="input input-bordered w-1/2 md:mr-2 input-sm"
                                    value={newCapacity} min="0.1" max="10000" step={0.1}
                                    onChange={(e) => setNewCapacity(e.target.value)}
                                    required disabled={!['7', '8'].includes(selectedCategory)}
                                />
                                <input
                                    type="number"
                                    placeholder='Portée (Km)'
                                    className="input input-bordered w-1/2 md:ml-2 input-sm"
                                    value={newScope} min="0.01" max="10000" step={0.01}
                                    onChange={(e) => setNewScope(e.target.value)}
                                    required disabled={!['7'].includes(selectedCategory)}
                                />
                            </div>
                            <div className="flex justify-center mb-4">
                                <input
                                    type="number"
                                    placeholder='Nombre de chambres'
                                    className="input input-bordered w-1/2 md:mr-2 input-sm"
                                    value={newRoomNumber} min="0" max="10"
                                    onChange={(e) => setNewRoomNumber(e.target.value)}
                                    required disabled={!['8'].includes(selectedCategory)}
                                />
                                <input
                                    type="number"
                                    placeholder='Nombre de têtes'
                                    className="input input-bordered w-1/2 md:ml-2 input-sm"
                                    value={newHeadsNumber} min="1" max="100"
                                    onChange={(e) => setNewHeadsNumber(e.target.value)}
                                    required disabled={!['3'].includes(selectedCategory)}
                                />
                            </div>
                            <div className="flex justify-center mb-4">
                                <input
                                    type="number"
                                    placeholder='Min temperature (°C)'
                                    className="input input-bordered w-1/2 md:mr-2 input-sm"
                                    value={newMinT} min="0" max="10"
                                    onChange={(e) => setNewMinT(e.target.value)}
                                    required disabled={!['8'].includes(selectedCategory)}
                                />
                                <input
                                    type="number"
                                    placeholder='Max temperature (°C)'
                                    className="input input-bordered w-1/2 md:ml-2 input-sm"
                                    value={newMaxT} min="0" max="10"
                                    onChange={(e) => setNewMaxT(e.target.value)}
                                    required disabled={!['8'].includes(selectedCategory)}
                                />
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="form-control">
                            <select
                                className="select select-bordered mb-4 select-sm"
                                value={selectedShop}
                                onChange={(e) => setSelectedShop(e.target.value)}
                                required
                            >
                                <option disabled value="">Boutique</option>
                                {shops.map((shop) => (
                                    <option key={shop.id} value={shop.id}>{shop.nom}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Titre"
                                className="input input-bordered mb-4"
                                value={newProductTitle}
                                onChange={(e) => setNewProductTitle(e.target.value)}
                                required
                            />
                            <div className="flex justify-center mb-4">
                                <input
                                    type="number"
                                    placeholder='Prix (DZD دج)'
                                    className="input input-bordered w-1/2 md:mr-2 input-sm"
                                    value={newProductPrice} min={1} max={1000000000} step={0.01}
                                    onChange={(e) => setNewProductPrice(e.target.value)}
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder='Unité' min={0} max={100}
                                    className="input input-bordered w-1/2 md:ml-2 input-sm"
                                    value={newProductUnite}
                                    onChange={(e) => setNewProductUnite(e.target.value)}
                                    required
                                />
                            </div>
                            <textarea
                                className="textarea textarea-bordered mb-4"
                                value={newProductDescription}
                                onChange={(e) => setNewProductDescription(e.target.value)}
                                required placeholder='Description'
                            ></textarea>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="form-control">
                            <div className='flex justify-center'>
                                <Image
                                    src={selectedImage || ""}
                                    className='border-4 text-center border-neutral rounded-lg mb-5'
                                    width={250}
                                    height={150}
                                    alt="Choisir l'image de l'annonce"
                                />
                            </div>
                            <div className="join">
                                <input
                                    type='file' accept='image/png, image/gif, image/jpeg'
                                    className='file-input file-input-bordered w-full join-item'
                                    onChange={handleImageChange}
                                />
                                <button onClick={handleImageDelete} type="button" className="btn join-item btn-error">Supprimer</button>
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div>
                            <p className="text-center">Revoir les informations et publier l'article<br /><br /></p>
                            <div className="overflow-x-auto">
                                <table className="table table-xs">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>Price</th>
                                            <th>Unit</th>
                                            <th>Category</th>
                                            <th>Product</th>
                                            <th>Shop</th>
                                            <th>Image</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>{newProductTitle}</td>
                                            <td>{newProductDescription}</td>
                                            <td>{newProductPrice}</td>
                                            <td>{newProductUnite}</td>
                                            <td>{categories[selectedCategory]}</td>
                                            <td>{selectedProduct}</td>
                                            <td>{selectedShop}</td>
                                            <td>
                                                {selectedImage ? (
                                                    <img src={selectedImage} alt="Selected Image" className="w-20 h-20 object-cover rounded-lg" />
                                                ) : (
                                                    "No image selected"
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    <div className="modal-action flex justify-between">
                        {currentStep > 1 && (
                            <button type="button" className="btn btn-secondary" onClick={prevStep}>
                                Retour
                            </button>
                        )}
                        {currentStep == 1 && (
                            <button
                                type="button"
                                className={`btn btn-primary ${currentStep === 1 ? 'ml-auto' : ''}`}
                                onClick={nextStep}
                                disabled={isNextDisabledStep1}
                            >
                                Suivant
                            </button>
                        )}
                        {currentStep == 2 && (
                            <button
                                type="button"
                                className={`btn btn-primary ${currentStep === 1 ? 'ml-auto' : ''}`}
                                onClick={nextStep}
                                disabled={isNextDisabledStep2}
                            >
                                Suivant
                            </button>
                        )}
                        {currentStep == 3 && (
                            <button
                                type="button"
                                className={`btn btn-primary ${currentStep === 1 ? 'ml-auto' : ''}`}
                                onClick={nextStep}
                                disabled={isNextDisabledStep3}
                            >
                                Suivant
                            </button>
                        )}
                        {currentStep === 4 && (
                            <button type="submit" className="btn btn-primary">
                                Publier
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </dialog>
    );
}