'use client'

import Link from "next/link";
import Layout from "../layout";
import Image from "next/image";
import Logo from '../logo.png';
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from 'react';
import CryptoJS from 'crypto-js';
import { auth } from '../../components/firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import ReCAPTCHA from "react-google-recaptcha";

function RegisterComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [recaptchaValide, setRecaptchaValide] = useState(false);

    useEffect(() => {
        // Récupérer les paramètres d'URL
        if (searchParams.get("email") && searchParams.get("password")) {
            setEmail(decodeURIComponent(searchParams.get("email")));
            const bytes = CryptoJS.AES.decrypt(searchParams.get("password"), 'djilali');
            setPassword(bytes.toString(CryptoJS.enc.Utf8));
        }
    }, []);

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
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            await updateProfile(userCredential.user, {
                displayName: username,
            });

            setError('')
            setSuccess('Un email de vérification a été envoyé !');
            setTimeout(() => {
                router.push('/');
            }, 3000); // Attendre 3 secondes avant de rediriger
        } catch (err) {
            setError('Échec de l\'inscription. Veuillez réessayer.');
        }
    };

    return (
        <Layout layoutType="login">
            <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-[url('https://149725886.v2.pressablecdn.com/wp-content/uploads/map_07-28-21_300dpi_19.19x26.89_inv2823c-scaled.jpg')]">
                <div className="w-full p-6 border-t-4 border-neutral rounded-md shadow-xl lg:max-w-lg bg-base-300 bg-opacity-100">
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
                    {success && (
                        <div role="alert" className="alert alert-success mb-4">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 shrink-0 stroke-current"
                                fill="none"
                                viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{success}</span>
                        </div>
                    )}
                    {!success &&
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <label className="input input-bordered flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zM20 8l-7.475 4.675q-.125.075-.262.113t-.263.037t-.262-.037t-.263-.113L4 8v10h16zm-8 3l8-5H4zM4 8v.25v-1.475v.025V6v.8v-.012V8.25zv10z"></path></svg>
                                <input type="email" className="grow" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1"></path></svg>
                                <input type="text" className="grow" placeholder="Pseudo" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M4 13q-1.25 0-2.125-.875T1 10t.875-2.125T4 7t2.125.875T7 10t-.875 2.125T4 13m-2 6v-2h20v2zm10-6q-1.25 0-2.125-.875T9 10t.875-2.125T12 7t2.125.875T15 10t-.875 2.125T12 13m8 0q-1.25 0-2.125-.875T17 10t.875-2.125T20 7t2.125.875T23 10t-.875 2.125T20 13"></path></svg>
                                <input type="password" className="grow" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </label>
                            <label className="input input-bordered flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M4 13q-1.25 0-2.125-.875T1 10t.875-2.125T4 7t2.125.875T7 10t-.875 2.125T4 13m-2 6v-2h20v2zm10-6q-1.25 0-2.125-.875T9 10t.875-2.125T12 7t2.125.875T15 10t-.875 2.125T12 13m8 0q-1.25 0-2.125-.875T17 10t.875-2.125T20 7t2.125.875T23 10t-.875 2.125T20 13"></path></svg>
                                <input type="password" className="grow" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </label>
                            <ReCAPTCHA className='mb-4'
                                sitekey="6LeUTxUqAAAAAD9QsWtDW-DBjJcWcwnoBwKmQvny"
                                onChange={() => setRecaptchaValide(!recaptchaValide)}
                            />
                            <div>
                                <button type="submit" disabled={!recaptchaValide} className="btn btn-block btn-neutral">S'inscrire</button>
                            </div>
                            <br />
                            <Link href="/login" className="text-xs text-gray-500 hover:underline">Déja inscrit ? Se connecter !</Link>
                        </form>
                    }
                </div>
            </div>
        </Layout>
    );
}

export default function Register() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RegisterComponent />
        </Suspense>
    );
}
