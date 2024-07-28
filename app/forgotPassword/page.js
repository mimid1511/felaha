'use client'

import Layout from "../layout";
import Image from "next/image";
import Logo from '../logo.png';
import { useRouter } from "next/navigation";
import { useState } from 'react';
import { auth } from '../../components/firebaseConfig';
import { sendPasswordResetEmail } from "firebase/auth";
import Link from "next/link";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(email)) {
            setError('Email invalide.');
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess('Votre email de réinitialisation a été envoyé avec succès.');
            setError('');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            setError('Échec de l\'envoi. Veuillez vérifier votre adresse mail.');
            setSuccess('');
        }
    };

    return (
        <Layout layoutType="login">
            <div className="flex items-center justify-center min-h-screen bg-cover bg-center bg-[url('https://149725886.v2.pressablecdn.com/wp-content/uploads/map_07-28-21_300dpi_19.19x26.89_inv2823c-scaled.jpg')]">
                <div className="w-full p-6 border-t-4 border-base-100 rounded-md shadow-xl lg:max-w-lg bg-primary bg-opacity-100">
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
                    {!success && (
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <label className="input flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-70" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zM20 8l-7.475 4.675q-.125.075-.262.113t-.263.037t-.262-.037t-.263-.113L4 8v10h16zm-8 3l8-5H4zM4 8v.25v-1.475v.025V6v.8v-.012V8.25zv10z"></path></svg>
                                <input type="text" className="grow" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </label>
                            <div>
                                <button type="submit" className="btn btn-block btn-secondary">Envoyer un mail de réinitialisation</button>
                            </div>
                            <br />
                            <Link href="/login" className="text-xs text-gray-600 hover:underline">Vous connaissez votre mot de passe ? Connectez-vous !</Link>
                        </form>
                    )}
                </div>
            </div>
        </Layout>
    );
}
