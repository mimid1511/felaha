import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "AIzaSyAtHEBytnKY-UVFfwG3KbylyCB34YilLXc";

const MapFindPlaceRender = ({wilaya, setWilaya, commune, setCommune, adresse, setAdresse, manualMarkerPosition, setManualMarkerPosition}) => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleMapClick = (event) => {
    const newPosition = { lat: event.detail.latLng.lat, lng: event.detail.latLng.lng };
    setManualMarkerPosition(newPosition);
    reverseGeocode(newPosition);
  };

  const reverseGeocode = async (position) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addressComponents = results[0].address_components;
        const countryComponent = addressComponents.find(component =>
          component.types.includes("country")
        );

        // Check if the country is Algeria
        if (countryComponent && countryComponent.short_name !== "DZ") {
          // Reset fields if the country is not Algeria
          setWilaya("");
          setCommune("");
          setAdresse("");
          return;
        }

        // Set Wilaya
        const wilayaComponent = addressComponents.find(component =>
          component.types.includes("administrative_area_level_1")
        );
        setWilaya(wilayaComponent?.long_name ? wilayaComponent.long_name : "");

        // Set Commune
        const communeComponent = addressComponents.find(component =>
          component.types.includes("administrative_area_level_2")
        );
        const localityComponent = addressComponents.find(component =>
          component.types.includes("locality")
        );
        setCommune((localityComponent?.long_name ? localityComponent?.long_name : "") +
          (localityComponent?.long_name !== communeComponent?.long_name ?
            " (" + communeComponent?.long_name + ")" : ""));
        // Set Adresse
        const streetNumberComponent = addressComponents.find(component =>
          component.types.includes("street_number")
        );
        const routeComponent = addressComponents.find(component =>
          component.types.includes("route")
        );
        const plusCodeComponent = addressComponents.find(component =>
          component.types.includes("plus_code")
        );
        if (streetNumberComponent && routeComponent) {
          setAdresse(`${streetNumberComponent.long_name} ${routeComponent.long_name}`);
        } else {
          // Fallback to plus_code if available
          setAdresse(plusCodeComponent ? plusCodeComponent.long_name : "");
        }
      } else {
        // Handle error case
        console.error("Geocode was not successful for the following reason: " + status);
      }
    });
  };

  useEffect(() => {
    if (manualMarkerPosition) {
      reverseGeocode(manualMarkerPosition);
    }
  }, [manualMarkerPosition]);

  return (
    <APIProvider apiKey={API_KEY} solutionChannel="GMP_devsite_samples_v3_rgmautocomplete">
      <Map
        mapId={"bf51a910020fa25a"}
        defaultZoom={6}
        defaultCenter={{ lat: 34.666667, lng: 3.25 }}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        onClick={handleMapClick}
        style={{ width: '100%', height: '50vh' }}
      >
        <AdvancedMarker ref={markerRef} position={manualMarkerPosition || null} />
      </Map>
      <MapControl position={ControlPosition.LEFT_TOP}>
        <div className="autocomplete-control">
          <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
        </div>
      </MapControl>
      <MapHandler place={selectedPlace} marker={marker} setManualMarkerPosition={setManualMarkerPosition} />
      <div className="form-container mt-4 mb-4">
        <input className="input input-bordered w-full mb-4" placeholder="Wilaya" type="text" value={wilaya} readOnly />
        <input className="input input-bordered w-full mb-4" placeholder="Commune" type="text" value={commune} readOnly />
        <input className="input input-bordered w-full" placeholder="Adresse" type="text" value={adresse} readOnly />
      </div>
    </APIProvider>
  );
};

const MapHandler = ({ place, marker, setManualMarkerPosition }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place || !marker) return;

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry?.viewport);
    }

    const position = place.geometry?.location;
    marker.position = position;
    setManualMarkerPosition(position);
  }, [map, place, marker, setManualMarkerPosition]);

  return null;
};

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ["geometry", "name", "formatted_address"],
      types: ["address"], // Limite les résultats aux adresses
      componentRestrictions: { country: "DZ" } // Limite aux adresses en Algérie
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener("place_changed", () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container mt-2 ml-2">
      <input type="text" ref={inputRef} className="input w-full" placeholder="Rechercher une adresse" />
    </div>
  );
};

export default MapFindPlaceRender;