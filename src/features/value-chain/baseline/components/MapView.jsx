
import { useEffect } from 'react';

import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Popup,
    useMap
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

// Automatically zoom to farmer locations
function FitMap({ farmers }) {
    const map = useMap();

    useEffect(() => {
        if (!farmers.length) return;

        const bounds = farmers.map(farmer => [
            Number(farmer.latitude),
            Number(farmer.longitude)
        ]);

        map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 13
        });

    }, [farmers, map]);

    return null;
}

// Farmer information popup
function FarmerPopup({ farmer }) {
    const details = [
        ['Record ID', farmer.RecordId],
        ['Beneficiary / source ID', farmer.Beneficiary],
        ['Farmer name', farmer.Farmer_name],
        ['District', farmer.district],
        ['Gender', farmer.Gender],
        ['Enumerator', farmer.Enumerator_name],
        ['Survey date', farmer.Date],
        ['NIC number', farmer.NIC_No],
        ['Telephone number', farmer.contact_No],
    ].filter(([, value]) => value !== null && value !== undefined && value !== '');

    return (
        <div className="w-72 max-h-80 overflow-y-auto">

            <h3 className="font-bold text-base mb-2 text-green-800">
                Tea Farmer Information
            </h3>

            <div className="space-y-2">

                {details.map(([label, value]) => (
                    <div
                        key={label}
                        className="border-b border-gray-200 pb-1"
                    >
                        <p className="text-xs text-gray-500 font-medium">
                            {label}
                        </p>

                        <p className="text-sm text-gray-800 break-words">
                            {String(value)}
                        </p>
                    </div>
                ))}

                <div className="pt-2">
                    <p className="text-xs text-gray-500">
                        Latitude: {farmer.latitude}
                    </p>

                    <p className="text-xs text-gray-500">
                        Longitude: {farmer.longitude}
                    </p>
                </div>

            </div>
        </div>
    );
}

export default function MapView({ farmers }) {

    const validFarmers = farmers.filter(farmer => {
        const lat = Number(farmer.latitude);
        const lng = Number(farmer.longitude);

        return (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
        );
    });

    return (
        <MapContainer
            center={[6.5, 80.4]}
            zoom={9}
            scrollWheelZoom={true}
            className="h-full w-full"
        >

            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FitMap farmers={validFarmers} />

            {validFarmers.map((farmer, index) => (

                <CircleMarker
                    key={farmer.RecordId ?? farmer.GEF_7_LD_BD_Projec ?? index}
                    center={[
                        Number(farmer.latitude),
                        Number(farmer.longitude)
                    ]}
                    radius={7}
                    pathOptions={{
                        color: '#ffffff',
                        weight: 1.5,
                        fillColor: '#a31616',
                        fillOpacity: 0.85
                    }}
                >

                    <Popup>
                        <FarmerPopup farmer={farmer} />
                    </Popup>

                </CircleMarker>

            ))}

        </MapContainer>
    );
}
