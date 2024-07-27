'use client'
import React from 'react';

const Title = ({ children }) => {
    return (
        <div className='p-4 bg-base-200'>
            <h1 className='text-4xl text-neutral font-bold text-center'>
                {children}
            </h1>
        </div>
    );
};

export default Title;