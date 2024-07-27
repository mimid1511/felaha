'use client'
import dynamic from 'next/dynamic';
import React from 'react';
import Layout from "../layout";
import Title from '@/components/Title';

const MapRender = dynamic(() => import('../../components/MapRender'), { ssr: false });

const MapPage = () => {
  return (
    <Layout layoutType="home">
      <div>
        <Title>Points de vente</Title>
        <MapRender />
      </div>
    </Layout>
  );
};

export default MapPage;
