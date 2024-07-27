'use client';

import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/app/layout';
import Title from '@/components/Title';
import { db, auth } from '@/components/firebaseConfig';
import { collection, addDoc, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const Listing = ({ params }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [interlocutor, setInterlocutor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesContainerRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (params.id && params.id != currentUser.uid) {
                    setInterlocutor(decodeURIComponent(params.id));
                } else {
                    router.push("/map");
                }
            } else {
                router.push("/login");
            }
        });
        return () => unsubscribe();
    }, [params.id, router]);

    useEffect(() => {
        if (user && interlocutor) {
            const q = query(collection(db, 'messages'), where('participants', 'array-contains', user.uid));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const msgs = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.participants.includes(interlocutor)) {
                        msgs.push(data);
                    }
                });
                msgs.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());
                setMessages(msgs);
            });
            return () => unsubscribe();
        }
    }, [user, interlocutor]);

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') {
            return;
        }
        try {
            await addDoc(collection(db, 'messages'), {
                text: newMessage,
                sender: user.uid,
                receiver: interlocutor,
                timestamp: new Date(),
                participants: [user.uid, interlocutor]
            });
            setNewMessage('');
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message :', error);
        }
    };

    return (
        <Layout layoutType="home">
            <Title>Message</Title>
            <div className="p-8 bg-[url('../app/background-white.jpg')] bg-repeat bg-contain">
                <div className="bg-base-200 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
                    <div
                        className="p-4"
                        style={{ maxHeight: '400px', overflowY: 'auto' }}
                        ref={messagesContainerRef}
                    >
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat ${msg.sender === user.uid ? 'chat-end' : 'chat-start'}`}>
                                <div className="chat-image avatar">
                                    <div className="w-10 rounded-full">
                                        <img
                                            alt="Avatar"
                                            src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                                        />
                                    </div>
                                </div>
                                <div className={`chat-header ${msg.sender === user.uid ? 'text-primary' : ''}`}>
                                    {msg.sender === user.uid ? 'Vous' : 'Interlocuteur'}&nbsp;
                                    <time className="text-xs opacity-50">{msg.timestamp.toDate().toLocaleTimeString()}</time>
                                </div>
                                <div className={`chat-bubble ${msg.sender === user.uid ? 'bg-primary text-white' : ''}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <textarea
                        className="textarea textarea-bordered w-full mt-4 mb-3"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    ></textarea>
                    <button className="btn btn-block btn-primary" onClick={handleSendMessage}>
                        Envoyer
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default Listing;
