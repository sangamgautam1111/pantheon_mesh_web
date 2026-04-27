"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, X, Check, MapPin as MapPinIcon } from "lucide-react";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface DeliveryMapProps {
    initialCoords: { lat: number; lng: number } | null;
    initialAddress: string;
    onSelect: (data: { address: string; coords: { lat: number; lng: number } }) => void;
    onClose: () => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function DeliveryMap({ initialCoords, initialAddress, onSelect, onClose }: DeliveryMapProps) {
    const [coords, setCoords] = useState<{ lat: number; lng: number }>(
        initialCoords || { lat: 27.7172, lng: 85.3240 } // Default to Kathmandu
    );
    const [address, setAddress] = useState(initialAddress);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // Reverse geocoding
    const fetchAddress = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                setAddress(data.display_name);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const newCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                setCoords(newCoords);
                setAddress(data[0].display_name);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const MapClickHandler = () => {
        useMapEvents({
            contextmenu(e) {
                const newCoords = { lat: e.latlng.lat, lng: e.latlng.lng };
                setCoords(newCoords);
                fetchAddress(newCoords.lat, newCoords.lng);
            },
        });
        return null;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-xl font-black text-slate-950">Select Delivery Point</h2>
                        <p className="text-xs font-bold text-slate-500">Right-click on the map to pinpoint your location</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <form onSubmit={handleSearch} className="relative">
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search for your city, street or area..."
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-950 outline-none font-bold text-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        {isSearching && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 animate-pulse">
                                SEARCHING...
                            </div>
                        )}
                    </form>
                </div>

                {/* Map Area */}
                <div className="flex-1 relative bg-slate-200">
                    <MapContainer 
                        center={[coords.lat, coords.lng]} 
                        zoom={13} 
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[coords.lat, coords.lng]} icon={DefaultIcon} />
                        <MapClickHandler />
                        <MapUpdater center={[coords.lat, coords.lng]} />
                    </MapContainer>
                    
                    {/* Floating Address Indicator */}
                    <div className="absolute bottom-6 left-6 right-6 z-[1000]">
                        <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-slate-950 text-white rounded-xl">
                                    <MapPinIcon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pinpointed Address</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">{address || "Pin a location on the map"}</p>
                                </div>
                                <button 
                                    onClick={() => onSelect({ address, coords })}
                                    className="px-6 py-2 bg-slate-950 text-white rounded-xl text-sm font-black hover:scale-105 transition-transform"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
