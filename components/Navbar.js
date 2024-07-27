'use client';

import Link from 'next/link';
import Image from 'next/image';
import Logo from '../app/logo.png';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import { auth, storage } from '../components/firebaseConfig';
import { ref, getDownloadURL } from "firebase/storage";
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default function Navbar({setTheme}) {
    const router = useRouter();
    const pathname = usePathname()
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);
    const [profilePicture, setprofilePicture] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const imgProfilePicture = ref(storage, 'user/' + currentUser.uid + '/profile-picture.jpg');
                const imgProfilePictureRandom = ref(storage, 'items/profile-picture-random.jpg');
                getDownloadURL(imgProfilePicture)
                    .then((url) => {
                        setprofilePicture(url);
                    })
                    .catch((error) => {
                        getDownloadURL(imgProfilePictureRandom)
                            .then((url) => {
                                setprofilePicture(url);
                            })
                            .catch((error) => {
                                setprofilePicture('');
                            });
                    });
                setLoading(!loading);
            }
            else {
                setLoading(!loading);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Encrypt password using CryptoJS
        const encryptedPassword = CryptoJS.AES.encrypt(password, 'djilali').toString();

        // Construct URL with hashed parameters
        const queryString = `email=${encodeURIComponent(email)}&password=${encodeURIComponent(encryptedPassword)}`;
        const loginUrl = `/login?${queryString}`;

        // Redirect to login page with hashed parameters
        router.push(loginUrl);
    };

    // Function to handle sign out
    const handleSignOut = () => {
        signOut(auth).then(() => {
            // Sign-out successful, refresh the page
            window.location.reload();
        }).catch((error) => {
            // An error happened, handle error as needed
            console.error('Error signing out:', error);
        });
    };

    return (
        <div className="navbar bg-white sticky top-0 drop-shadow" style={{ zIndex: "1" }}>
            <div className="navbar-start">
                <div className="dropdown">
                    <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </div>
                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
                        <li><a>Item 1</a></li>
                        <li>
                            <a>Parent</a>
                            <ul className="p-2">
                                <li><a>Submenu 1</a></li>
                                <li><a>Submenu 2</a></li>
                            </ul>
                        </li>
                        <li><a>Item 3</a></li>
                    </ul>
                </div>
                <Link href="/">
                    <Image className='ml-3' src={Logo} alt="Logo de Felaha DZ" width={125} />
                </Link>
            </div>
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 space-x-4">
                    <li><Link href="/" className={pathname === '/' ? 'odd:bg-base-200 font-bold' : ''}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19h3v-6h6v6h3v-9l-6-4.5L6 10zm-2 2V9l8-6l8 6v12h-7v-6h-2v6zm8-8.75"></path></svg>Accueil</Link></li>
                    <li><Link href="/map" className={pathname === '/map' ? 'odd:bg-base-200 font-bold' : ''}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} color="currentColor"><path d="M22 10v-.783c0-1.94 0-2.909-.586-3.512c-.586-.602-1.528-.602-3.414-.602h-2.079c-.917 0-.925-.002-1.75-.415L10.84 3.021c-1.391-.696-2.087-1.044-2.828-1.02S6.6 2.418 5.253 3.204l-1.227.716c-.989.577-1.483.866-1.754 1.346C2 5.746 2 6.33 2 7.499v8.217c0 1.535 0 2.303.342 2.73c.228.285.547.476.9.54c.53.095 1.18-.284 2.478-1.042c.882-.515 1.73-1.05 2.785-.905c.884.122 1.705.68 2.495 1.075M8 2v15m7-12v4.5"></path><path d="M18.308 21.684A1.18 1.18 0 0 1 17.5 22c-.302 0-.591-.113-.808-.317c-1.986-1.87-4.646-3.96-3.349-6.993C14.045 13.05 15.73 12 17.5 12s3.456 1.05 4.157 2.69c1.296 3.03-1.358 5.13-3.349 6.993M17.5 16.5h.009"></path></g></svg>Producteurs et points de vente</Link></li>
                    {/* odd:bg-base-200 */}
                    {/* <li>
                        <details>
                            <summary><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><g fill="none"><path d="M0 0h48v48H0z"></path><path fill="currentColor" fillRule="evenodd" d="M18.88 7.566a1 1 0 0 1 1 1v6.6a1 1 0 1 1-2 0v-6.6a1 1 0 0 1 1-1" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M11.78 13.905c1.13-.27 2.283-.065 3.48.553c.975.505 1.667.736 2.206.847c.538.112.966.114 1.483.114v2h-.02c-.516 0-1.12 0-1.868-.155c-.757-.157-1.622-.462-2.72-1.03c-.878-.453-1.54-.517-2.096-.384c-.584.14-1.201.53-1.912 1.264c-1.632 1.688-2.139 3.426-2.316 4.762c-.1 1.644.197 4.89 1.668 8.063c.5 1.08 1.21 2.57 2.076 3.737c.432.582.866 1.03 1.283 1.306c.405.267.741.34 1.046.288c3.123-.538 3.71-.551 4.319-.551h1.037v2H18.38c-.422 0-.92 0-3.95.522c-.94.162-1.787-.127-2.488-.59c-.689-.455-1.284-1.106-1.787-1.783c-1.005-1.353-1.791-3.024-2.284-4.088c-1.638-3.532-1.972-7.137-1.848-9.064l.003-.032l.004-.032c.212-1.644.844-3.839 2.866-5.928c.845-.874 1.783-1.556 2.885-1.82" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M14.64 11.41c1.496 1.431 2.307 3.166 2.307 4.51a1 1 0 1 0 2 0c0-2.05-1.168-4.275-2.925-5.956C14.244 8.265 11.743 7 8.896 7a1 1 0 0 0 0 2c2.244 0 4.268.999 5.743 2.41" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M8.574 7.009a1 1 0 0 1 1.116.868c.492 3.93 3.945 6 6.734 7.115a1 1 0 0 1-.743 1.857c-2.869-1.147-7.335-3.604-7.975-8.724a1 1 0 0 1 .868-1.116m17.188 6.894c-1.152-.264-2.334-.066-3.57.548c-1.02.506-1.747.74-2.317.853s-1.022.115-1.56.115a1 1 0 0 0 0 2h.019c.537 0 1.16 0 1.93-.153c.781-.155 1.676-.458 2.816-1.024c.924-.458 1.632-.528 2.236-.39c.626.144 1.277.542 2.017 1.277c1.716 1.703 2.235 3.452 2.414 4.784a1 1 0 0 0 1.982-.266c-.222-1.653-.884-3.85-2.987-5.938c-.881-.874-1.85-1.548-2.98-1.806m.945 20.377a1 1 0 0 0-1.414.027c-.757.786-1.393 1.05-1.931.962c-3.252-.538-3.86-.55-4.485-.55a1 1 0 0 0 0 2h.028c.447 0 .967 0 4.13.523c1.522.252 2.785-.599 3.699-1.548a1 1 0 0 0-.027-1.415" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M32.65 16.103c-1.003 1.81-1.263 3.709-.864 4.992a1 1 0 1 1-1.91.594c-.609-1.959-.153-4.43 1.025-6.556c1.193-2.152 3.206-4.101 5.925-4.947a1 1 0 1 1 .594 1.91c-2.143.666-3.78 2.222-4.77 4.007" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M34.719 17.379c-1.168 1.71-2.748 2.793-4.073 3.013a1 1 0 1 0 .326 1.973c2.023-.335 4.027-1.851 5.398-3.858c1.388-2.032 2.227-4.706 1.762-7.515a1 1 0 1 0-1.974.326c.367 2.214-.288 4.375-1.44 6.06" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M31.78 23a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m-4.5 2.5a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M37.845 18.09a4.5 4.5 0 0 1 2.716 5.755a1 1 0 1 1-1.883-.675a2.5 2.5 0 1 0-4.706-1.69a1 1 0 0 1-1.882-.675a4.5 4.5 0 0 1 5.755-2.715" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M36.253 23.176a4.501 4.501 0 0 1 3.822 8.014a1 1 0 1 1-1.144-1.64a2.5 2.5 0 1 0-3.008-3.99a1 1 0 1 1-1.262-1.552a4.5 4.5 0 0 1 1.592-.832M27.78 29a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m-4.5 2.5a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M35.78 29a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m-4.5 2.5a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M31.78 35a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5m-4.5 2.5a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1-9 0" clipRule="evenodd"></path><path fill="currentColor" fillRule="evenodd" d="M37.834 33.966a1 1 0 0 1 1.278-.606a4.5 4.5 0 1 1-4.675 7.44a1 1 0 1 1 1.405-1.423a2.5 2.5 0 1 0 2.598-4.133a1 1 0 0 1-.606-1.278" clipRule="evenodd"></path></g></svg> Produits</summary>
                            <ul className="p-2 w-60">
                                <li><a>Fruits</a></li>
                                <li><a>Légumes</a></li>
                                <li><a>Viandes Rouges</a></li>
                                <li><a>Viandes Blanches</a></li>
                                <li><a>Lait et Produits Laitiers</a></li>
                                <li><a>Autres</a></li>
                            </ul>
                        </details>
                    </li> */}
                    <li><Link href="/news" className=''><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h11l5 5v11q0 .825-.587 1.413T19 21zm0-2h14V9h-4V5H5zm2-2h10v-2H7zm0-8h5V7H7zm0 4h10v-2H7zM5 5v4zv14z"></path></svg>Actualités</Link></li>
                    <li><Link href="/events" className=''><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h11l5 5v11q0 .825-.587 1.413T19 21zm0-2h14V9h-4V5H5zm2-2h10v-2H7zm0-8h5V7H7zm0 4h10v-2H7zM5 5v4zv14z"></path></svg>Événements</Link></li>
                </ul>
            </div>
            <div className="navbar-end dropdown-bottom dropdown-end">
                <label className="swap swap-rotate mr-4">
                    <input type="checkbox" className="theme-controller" value="synthwave" />
                    <svg
                        className="swap-off w-7 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <path
                            d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                    </svg>
                    <svg
                        className="swap-on w-7 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24">
                        <path
                            d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                    </svg>
                </label>
                {!loading ? (
                    <div className="skeleton h-10 w-10 shrink-0 rounded-full"></div>
                ) : user ? (
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className={`w-10 rounded-full ${!user.emailVerified && 'ring ring-offset-2 ring-warning'}`}>
                                <img
                                    alt="User Avatar"
                                    src={profilePicture} />
                            </div>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            {!user.emailVerified && <div role="alert" className="alert text-xs p-1 alert-warning mb-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 shrink-0 stroke-current"
                                    fill="none"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Adresse mail non vérifiée</span>
                            </div>}
                            <li>
                                <Link href="/profil">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4"></path></svg>Profil
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="currentColor" d="M6.123 7.25L6.914 2H2.8L1.081 6.5C1.028 6.66 1 6.826 1 7c0 1.104 1.15 2 2.571 2c1.31 0 2.393-.764 2.552-1.75M10 9c1.42 0 2.571-.896 2.571-2c0-.041-.003-.082-.005-.121L12.057 2H7.943l-.51 4.875A2.527 2.527 0 0 0 7.429 7c0 1.104 1.151 2 2.571 2m5 1.046V14H5v-3.948c-.438.158-.92.248-1.429.248c-.195 0-.384-.023-.571-.049V16.6c0 .77.629 1.4 1.398 1.4H15.6c.77 0 1.4-.631 1.4-1.4v-6.348a4.297 4.297 0 0 1-.571.049A4.155 4.155 0 0 1 15 10.046M18.92 6.5L17.199 2h-4.113l.79 5.242C14.03 8.232 15.113 9 16.429 9C17.849 9 19 8.104 19 7c0-.174-.028-.34-.08-.5"></path></svg>
                                    Boutiques
                                </Link>
                            </li>
                            <li>
                                <a>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z"></path></svg>
                                    Parametres
                                </a>
                            </li>
                            <li><a onClick={handleSignOut}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L8.07 7.25A4.004 4.004 0 0 1 12 4m.28 10l6 6L20 21.72L18.73 23l-3-3H4v-2c0-1.84 2.5-3.39 5.87-3.86L2.78 7.05l1.27-1.27zM20 18v1.18l-4.86-4.86C18 14.93 20 16.35 20 18"></path></svg>Se déconnecter</a></li>
                        </ul>
                    </div>
                ) : (
                    <>
                        <Link href="/registration" className="btn btn-neutral m-1">Inscription</Link>
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-primary m-1">Se connecter</div>
                            <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-75 p-2 shadow-lg bg-primary text-primary-content">
                                <div className="card-body">
                                    <form className="space-y-4" onSubmit={handleSubmit}>
                                        <label className="input input-sm flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" /><path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" /></svg>
                                            <input
                                                type="text"
                                                className="grow"
                                                placeholder="Email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </label>
                                        <label className="input input-sm flex items-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 opacity-70"><path fillRule="evenodd" d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 1 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z" clipRule="evenodd" /></svg>
                                            <input
                                                type="password"
                                                className="grow"
                                                placeholder="Mot de passe"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </label>
                                        <a href="#" className="text-xs hover:underline">Mot de passe oublié ?</a>
                                        <div>
                                            <button type="submit" className="btn btn-sm btn-block btn-secondary">Connexion</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
