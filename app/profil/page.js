'use client'
import React, { useState, useEffect } from 'react';
import Layout from "../layout";
import Title from '@/components/Title';
import { auth, storage, db } from '@/components/firebaseConfig'; // Assurez-vous du chemin correct
import { onAuthStateChanged, updateProfile, sendEmailVerification } from "firebase/auth";
import { ref, getDownloadURL, uploadBytes, deleteObject } from "firebase/storage";
import { addDoc, collection } from 'firebase/firestore';
import ReCAPTCHA from 'react-google-recaptcha';
import Link from 'next/link';

const Profil = () => {
    const [user, setUser] = useState(null);
    const [pseudo, setPseudo] = useState('');
    const [email, setEmail] = useState('');
    const [profilPicture, setProfilePicture] = useState('');
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [deleteProfilePic, setDeleteProfilePic] = useState(false);
    const [randomPictureURL, setRandomPictureURL] = useState('');
    const [recaptchaValidated, setRecaptchaValidated] = useState(false);
    const [loading, setLoading] = useState(true); // Added loading state

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                loadUserProfile(currentUser);
                loadProfilePicture(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    const loadUserProfile = async (user) => {
        setPseudo(user.displayName);
        setEmail(user.email);
    };

    const loadProfilePicture = (uid) => {
        const imgProfilePicture = ref(storage, 'user/' + uid + '/profile-picture.jpg');
        const imgProfilePictureRandom = ref(storage, 'items/profile-picture-random.jpg');
        setLoading(true); // Set loading to true when starting to load profile picture
        getDownloadURL(imgProfilePicture)
            .then((url) => {
                setProfilePicture(url);
                setLoading(false); // Set loading to false once profile picture is loaded
            })
            .catch((error) => {
                getDownloadURL(imgProfilePictureRandom)
                    .then((url) => {
                        setProfilePicture(url);
                        setLoading(false); // Set loading to false once fallback picture is loaded
                    })
                    .catch((error) => {
                        setProfilePicture('');
                        setLoading(false); // Set loading to false if no picture is found
                    });
            });
        // Load the random picture URL for future use
        getDownloadURL(imgProfilePictureRandom)
            .then((url) => {
                setRandomPictureURL(url);
            })
            .catch((error) => {
                setRandomPictureURL('');
            });
    };

    const handleUpdateProfile = async () => {
        if (user) {
            if (newProfilePicture) {
                const imgProfilePicture = ref(storage, 'user/' + user.uid + '/profile-picture.jpg');
                await uploadBytes(imgProfilePicture, newProfilePicture);
                const newProfilePictureURL = await getDownloadURL(imgProfilePicture);
                await updateProfile(auth.currentUser, {
                    displayName: pseudo,
                    photoURL: newProfilePictureURL,
                });
                setProfilePicture(newProfilePictureURL);
            } else if (deleteProfilePic) {
                const imgProfilePicture = ref(storage, 'user/' + user.uid + '/profile-picture.jpg');
                await deleteObject(imgProfilePicture);
                await updateProfile(auth.currentUser, {
                    photoURL: randomPictureURL,
                });
                setProfilePicture(randomPictureURL);
                setDeleteProfilePic(false);
            } else {
                await updateProfile(auth.currentUser, {
                    displayName: pseudo,
                });
            }
            window.location.reload();
        }
    };

    const emailRenvoi = async (e) => {
        e.preventDefault(); // Prévenir le comportement par défaut du lien
    
        const recentReset = await checkRecentEmailReset();
        if (recentReset) {
            alert('Vous avez déjà demandé une réinitialisation de l\'email dans les dernières 24 heures.');
        } else {
            try {
                await sendEmailVerification(user);
                await logEmailResetAction(); // Enregistrez l'action dans Firestore
                alert('Email de vérification envoyé.');
            } catch (error) {
                console.error("Erreur lors de l'envoi de l'email de vérification:", error);
                alert('Il semble que nous vous avons déja envoyé un mail de vérification. Retentez plus tard. ;)');
            }
        }
    };
    
    const checkRecentEmailReset = async () => {
        if (user) {
            try {
                const historicalCollectionRef = collection(db, 'historical');
                const recentQuery = query(
                    historicalCollectionRef,
                    where('userId', '==', user.uid),
                    where('action', '==', 'réinitialisation mail'),
                    where('date', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)) // 24 heures en millisecondes
                );
                const querySnapshot = await getDocs(recentQuery);
                return !querySnapshot.empty; // Retourne true si un enregistrement récent est trouvé
            } catch (error) {
                console.error("Erreur lors de la vérification des réinitialisations récentes:", error);
                return false;
            }
        }
        return false;
    };
        
    
    const logEmailResetAction = async () => {
        if (user) {
            try {
                const historicalCollectionRef = collection(db, 'historical');
                await addDoc(historicalCollectionRef, {
                    userId: user.uid,
                    action: 'réinitialisation mail',
                    date: new Date(),
                });
            } catch (error) {
                console.error("Erreur lors de l'enregistrement dans la collection 'historical':", error);
            }
        }
    };
    

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setNewProfilePicture(e.target.files[0]);
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfilePicture(event.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleDeleteProfilePicture = () => {
        setDeleteProfilePic(true);
        setProfilePicture(randomPictureURL); // Display the random picture immediately
        setNewProfilePicture(null); // Clear the file input
        document.getElementById("fileInput").value = null; // Reset the file input field
    };

    const handleRecaptchaChange = (value) => {
        setRecaptchaValidated(!!value);
    };

    return (
        <Layout layoutType="home">
            <Title>Profil</Title>
            <div className="p-8 bg-[url('../app/background-dark.jpg')] bg-repeat bg-contain">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl mx-auto">
                    <div className="flex flex-col items-center mb-4">


                        {!loading && !user?.emailVerified &&
                            <div role="alert" className="alert alert-warning mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Adresse mail non vérifiée. Le compte sera supprimé dans 48h.</span><Link href="/"  onClick={emailRenvoi} >Renvoyez</Link>
                            </div>
                        }
                        <div className="avatar mb-4">
                            <div className="w-32 rounded">
                                {loading ? (
                                    <div className="skeleton h-32 w-32"></div> // Skeleton loader
                                ) : (
                                    <img src={profilPicture} alt="Profile" />
                                )}
                            </div>
                        </div>
                        <div className="join">
                            <input
                                id="fileInput"
                                type='file' accept='image/png, image/gif, image/jpeg'
                                className='file-input file-input-bordered w-full join-item'
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                className="btn join-item btn-error"
                                onClick={handleDeleteProfilePicture}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-4">
                        {loading ? (
                            <div className="skeleton h-12"></div> // Skeleton loader
                        ) : (
                            <input
                                type="text"
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                placeholder="Pseudo"
                                className="input input-bordered w-full"
                            />
                        )}
                        {loading ? (
                            <div className="skeleton h-12"></div> // Skeleton loader
                        ) : (
                            <input
                                type="email"
                                value={email} readOnly
                                placeholder="E-mail"
                                className="input input-bordered w-full"
                            />
                        )}
                        {loading ? (
                            <div className="skeleton h-12"></div> // Skeleton loader
                        ) : (
                            <div className="join ">
                                <input
                                    type="password"
                                    value={"passwordchanged"} readOnly
                                    placeholder="Nouveau mot de passe"
                                    className="input w-full input-bordered join-item"
                                />
                                <button className="btn btn-neutral join-item">Réinitialiser le mot de passe</button>
                            </div>
                        )}
                    </div>

                    <ReCAPTCHA className='mb-4'
                        sitekey="6LeUTxUqAAAAAD9QsWtDW-DBjJcWcwnoBwKmQvny"
                        onChange={handleRecaptchaChange}
                    />

                    <button
                        onClick={handleUpdateProfile}
                        className="btn btn-primary btn-wide w-full"
                        disabled={!recaptchaValidated}
                    >
                        Mettre à jour le profil
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Profil;
