'use client';

import Layout from "../layout";
import Image from "next/image";
import Logo from '../logo.png';
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from 'react';
import CryptoJS from 'crypto-js';
import { auth } from '../../components/firebaseConfig';
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

function LoginComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Récupérer les paramètres d'URL
        if (searchParams.get("email") && searchParams.get("password")) {
            setEmail(decodeURIComponent(searchParams.get("email")));
            const bytes = CryptoJS.AES.decrypt(searchParams.get("password"), 'djilali');
            setPassword(bytes.toString(CryptoJS.enc.Utf8));
        }
    }, [searchParams]);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        // Vérification que le mot de passe contient au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
        return re.test(password);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError('Email invalide.');
            return;
        }
        if (!validatePassword(password)) {
            setError('Le mot de passe doit contenir au moins 12 caractères, une minuscule, une majuscule, un chiffre et un caractère spécial.');
            return;
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (err) {
            setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
        }
    };

    return (
        <Layout>
            <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-[url('https://149725886.v2.pressablecdn.com/wp-content/uploads/map_07-28-21_300dpi_19.19x26.89_inv2823c-scaled.jpg')]" >
                <div className="w-full p-6 border-t-4 border-green-500 rounded-md shadow-xl lg:max-w-lg bg-white bg-opacity-100">
                    <div className="flex justify-center mb-8">
                        <Image src={Logo} alt="Logo de Felaha DZ" width={150} height={150} />
                    </div>
                    {error && (
                        <div role="alert" className="alert alert-error mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 shrink-0 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <label className="input input-bordered flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zM20 8l-7.475 4.675q-.125.075-.262.113t-.263.037t-.262-.037t-.263-.113L4 8v10h16zm-8 3l8-5H4zM4 8v.25v-1.475v.025V6v.8v-.012V8.25zv10z"></path></svg>
                            <input type="text" className="grow" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </label>
                        <label className="input input-bordered flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M4 13q-1.25 0-2.125-.875T1 10t.875-2.125T4 7t2.125.875T7 10t-.875 2.125T4 13m-2 6v-2h20v2zm10-6q-1.25 0-2.125-.875T9 10t.875-2.125T12 7t2.125.875T15 10t-.875 2.125T12 13m8 0q-1.25 0-2.125-.875T17 10t.875-2.125T20 7t2.125.875T23 10t-.875 2.125T20 13"></path></svg>
                            <input type="password" className="grow" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </label>
                        <div>
                            <button type="submit" className="btn btn-block btn-primary">Connexion</button>
                        </div>
                        <br />
                        <Link href="/forgotPassword" className="text-xs text-gray-600 hover:underline">Mot de passe oublié ?</Link>
                        <br />
                        <Link href="/registration" className="text-xs text-gray-600 hover:underline">Pas encore inscrit ? S'inscrire !</Link>
                    </form>
                </div>
            </div>
        </Layout>
    );
}

export default function Login() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginComponent />
        </Suspense>
    );
}
