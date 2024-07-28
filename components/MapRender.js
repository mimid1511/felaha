'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { db } from './firebaseConfig'; // Assurez-vous que firebaseConfig est correctement configuré
import { collection, query, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const MarkerWithInfoWindow = ({ position, shop }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowShown, setInfoWindowShown] = useState(false);

  const router = useRouter();

  const handleMarkerClick = useCallback(
    () => setInfoWindowShown(isShown => !isShown),
    []
  );

  const handleClose = useCallback(() => setInfoWindowShown(false), []);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={handleMarkerClick}
      >
        <Pin
          background={'#388000'}
          borderColor={'#111111'}
          glyphColor={'#111111'}
        />
      </AdvancedMarker>

      {infoWindowShown && (
        <InfoWindow anchor={marker} onClose={handleClose} className='p-2'>
          <h2 className='text-xl font-black	mb-4'>{shop.nom}</h2>
          <p className='mb-4'>{shop?.adresse}, {shop?.commune}, {shop?.wilaya} ({shop?.phone})</p>
          <div className="flex items-center text-gray-500 mb-4">
            <span className="mr-2 badge">...</span>
            <span className="mr-2 badge">...</span>
          </div>
          <div className="rating mb-4">
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
            <input
              type="radio"
              name="rating-2"
              className="mask mask-star-2 bg-orange-400"
              defaultChecked />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
            <input type="radio" name="rating-2" className="mask mask-star-2 bg-orange-400" />
          </div>
          <br />
          <div className="join join-vertical lg:join-horizontal">
            <button onClick={() => router.push("https://www.google.com/maps/dir//" + shop.location.latitude + "," + shop.location.longitude)} className="btn btn-info join-item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} color="currentColor"><path d="M10.08 2C5.47 2.936 2 7.012 2 11.899C2 17.478 6.522 22 12.101 22c4.887 0 8.963-3.47 9.899-8.08"></path><path d="M18.938 18A3.8 3.8 0 0 0 20 17.603m-5.312-.262q.895.39 1.717.58m-5.55-2.973c.413.29.855.638 1.285.938M3 13.826c.322-.157.67-.338 1.063-.493M6.45 13c.562.062 1.192.223 1.906.523M18 7.5a1.5 1.5 0 1 0-3 0a1.5 1.5 0 0 0 3 0"></path><path d="M17.488 13.62a1.46 1.46 0 0 1-.988.38a1.46 1.46 0 0 1-.988-.38c-2.427-2.244-5.679-4.752-4.093-8.392C12.277 3.259 14.335 2 16.5 2s4.223 1.26 5.08 3.228c1.585 3.636-1.66 6.155-4.092 8.392"></path></g></svg> Itiniraire GPS</button>
            <a href={`tel:${shop.phone}`} className="btn btn-primary join-item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4.05 21q-.45 0-.75-.3t-.3-.75V15.9q0-.325.225-.587t.575-.363l3.45-.7q.35-.05.713.063t.587.337L10.9 17q.95-.55 1.8-1.213t1.625-1.437q.825-.8 1.513-1.662t1.187-1.788L14.6 8.45q-.2-.2-.275-.475T14.3 7.3l.65-3.5q.05-.325.325-.562T15.9 3h4.05q.45 0 .75.3t.3.75q0 3.125-1.362 6.175t-3.863 5.55t-5.55 3.863T4.05 21"></path></svg>Téléphoner</a>
            <button onClick={() => router.push("/message/" + shop.user)} className="btn btn-secondary join-item"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m-2 12H6v-2h12zm0-3H6V9h12zm0-3H6V6h12z"></path></svg>Messages</button>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapRender = () => {
  const [shops, setShops] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [markersLoaded, setMarkersLoaded] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const q = query(collection(db, 'shop'));
        const querySnapshot = await getDocs(q);
        const shopsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setShops(shopsData);
        setMarkersLoaded(true); // Marqueurs chargés
      } catch (error) {
        console.error('Erreur lors de la récupération des boutiques:', error);
      }
    };

    fetchShops();
  }, []);

  return (
    <>
      <div className='bg-base-300' style={{ width: '100%', padding: 10 }}>
        <div className="join" style={{ display: 'flex', width: '100%' }}>
          <input className="input text-black join-item input-bordered" style={{ flexGrow: 1 }} placeholder="Rechercher un produit, un producteur..." />
          <button className="btn join-item btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.5em" height="1.5em" viewBox="0 0 24 24">
              <path fill="currentColor" fillRule="evenodd" d="M14.385 15.446a6.75 6.75 0 1 1 1.06-1.06l5.156 5.155a.75.75 0 1 1-1.06 1.06zm-7.926-1.562a5.25 5.25 0 1 1 7.43-.005l-.005.005l-.005.004a5.25 5.25 0 0 1-7.42-.004" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      </div>
      <APIProvider
        apiKey={'AIzaSyAtHEBytnKY-UVFfwG3KbylyCB34YilLXc'}
        onLoad={() => setMapLoaded(true)}
      >
        {(!mapLoaded || !markersLoaded) ? (
          <div className="loading-container" style={{ width: '100%', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="loading text-primary loading-ring loading-lg"></span>
          </div>
        ) : (
          <Map
            defaultZoom={7}
            mapId='MAP_1'
            defaultCenter={{ lat: 34.666667, lng: 3.250000 }}
            onCameraChanged={(ev) =>
              console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)
            }
            style={{ width: '100%', height: '80vh' }}
          >
            {shops.map(shop => (
              <MarkerWithInfoWindow
                key={shop.id}
                position={{ lat: shop.location.latitude, lng: shop.location.longitude }}
                shop={shop}
              />
            ))}
          </Map>
        )}
      </APIProvider>
    </>
  );
};

export default MapRender;
