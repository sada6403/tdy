import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

const BranchMap = ({ user }) => {
    const [userLocation, setUserLocation] = useState(null);
    const [sortedBranches, setSortedBranches] = useState([]);
    const [manualCity, setManualCity] = useState('');
    const [calculating, setCalculating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showInput, setShowInput] = useState(false);

    // Major Sri Lankan Cities/Towns with Coordinates
    const slCities = [
        { name: "Colombo", lat: 6.9271, lng: 79.8612 },
        { name: "Dehiwala-Mount Lavinia", lat: 6.8511, lng: 79.8659 },
        { name: "Moratuwa", lat: 6.773, lng: 79.8816 },
        { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
        { name: "Negombo", lat: 7.2008, lng: 79.8737 },
        { name: "Pita Kotte", lat: 6.8912, lng: 79.9009 },
        { name: "Kandy", lat: 7.2906, lng: 80.6337 },
        { name: "Trincomalee", lat: 8.5874, lng: 81.2152 },
        { name: "Kalmunai", lat: 7.4167, lng: 81.8333 },
        { name: "Galle", lat: 6.0535, lng: 80.221 },
        { name: "Point Pedro", lat: 9.8167, lng: 80.2333 },
        { name: "Batticaloa", lat: 7.7310, lng: 81.6747 },
        { name: "Katunayake", lat: 7.1725, lng: 79.8731 },
        { name: "Battaramulla", lat: 6.8980, lng: 79.9223 },
        { name: "Dambulla", lat: 7.8731, lng: 80.7718 },
        { name: "Daluguma", lat: 6.9667, lng: 79.9000 },
        { name: "Mahara", lat: 7.0000, lng: 79.9167 },
        { name: "Kotikawatta", lat: 6.9333, lng: 79.9000 },
        { name: "Chavakachcheri", lat: 9.6500, lng: 80.1333 },
        { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
        { name: "Vavuniya", lat: 8.7514, lng: 80.4971 },
        { name: "Kolonnawa", lat: 6.9167, lng: 79.8667 },
        { name: "Hendala", lat: 7.0000, lng: 79.8833 },
        { name: "Ratnapura", lat: 6.6828, lng: 80.3992 },
        { name: "Badulla", lat: 6.9797, lng: 81.0560 },
        { name: "Puttalam", lat: 8.033, lng: 79.826 },
        { name: "Devinuwara", lat: 5.9222, lng: 80.5739 },
        { name: "Kilinochchi", lat: 9.3803, lng: 80.4070 },
        { name: "Mannar", lat: 8.9810, lng: 79.9044 },
        { name: "Mullaitivu", lat: 9.2671, lng: 80.8142 },
        { name: "Matara", lat: 5.9549, lng: 80.5550 },
        { name: "Kurunegala", lat: 7.4863, lng: 80.3647 },
        { name: "Gampaha", lat: 7.0840, lng: 79.9939 },
        { name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891 },
        { name: "Hambantota", lat: 6.1429, lng: 81.1212 },
        { name: "Matale", lat: 7.4675, lng: 80.6234 },
        { name: "Polonnaruwa", lat: 7.9403, lng: 81.0188 },
        { name: "Monaragala", lat: 6.8719, lng: 81.3488 },
        { name: "Kegalle", lat: 7.2513, lng: 80.3464 }
    ];

    const [branches, setBranches] = useState([]);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                // Assuming you have imported PublicService or similar
                const { PublicService } = await import('../../../services/api');
                const response = await PublicService.getBranches();
                if (response && response.data) {
                    setBranches(response.data);
                    if (!userLocation) {
                        setSortedBranches(response.data);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch branches", error);
                // Fallback to hardcoded if backend is unreachable
                const fallback = [
                    { name: "Kilinochchi HQ", address: "150, Housing Scheme, Kannakipuram", lat: 9.3803, lng: 80.4070, type: 'Main Office' },
                    { name: "Jaffna Branch", address: "Stafford Road, Jaffna", lat: 9.6615, lng: 80.0255, type: 'Branch' },
                    { name: "Colombo Office", address: "Galle Road, Colombo 03", lat: 6.9271, lng: 79.8612, type: 'Branch' }
                ];
                setBranches(fallback);
                if (!userLocation) setSortedBranches(fallback);
            }
        };
        fetchBranches();
    }, [userLocation]);

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2 - lat1);
        const dLon = deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    };

    const deg2rad = (deg) => {
        return deg * (Math.PI / 180);
    };

    const findCityCoordinates = (cityName) => {
        if (!cityName) return null;
        const normalizedInput = cityName.toLowerCase().trim();
        return slCities.find(city => city.name.toLowerCase() === normalizedInput || normalizedInput.includes(city.name.toLowerCase()));
    };

    const performCalculation = (lat, lng, cityName) => {
        setUserLocation({ name: cityName, latitude: lat, longitude: lng });

        const branchesWithDist = branches.map(branch => {
            const dist = calculateDistance(lat, lng, branch.lat, branch.lng);
            return { ...branch, distance: dist };
        });

        const sorted = branchesWithDist.sort((a, b) => a.distance - b.distance);
        setSortedBranches(sorted);
        setCalculating(false);
        setShowInput(false);
    };

    const handleCalculateLocation = () => {
        setCalculating(true);
        setErrorMsg('');

        // 1. Try to use Profile Address first
        if (user && user.address && !manualCity) {
            const profileCity = findCityCoordinates(user.address);
            if (profileCity) {
                performCalculation(profileCity.lat, profileCity.lng, profileCity.name);
                return;
            } else {
                // If profile address doesn't match a known city, prompt manual input
                setErrorMsg('Could not detect city from profile. Please enter your city manually.');
                setShowInput(true);
                setCalculating(false);
                return;
            }
        }

        // 2. Use Manual Input
        if (manualCity) {
            const city = findCityCoordinates(manualCity);
            if (city) {
                performCalculation(city.lat, city.lng, city.name);
            } else {
                setErrorMsg('City not found. Please check spelling or try a major nearby city.');
                setCalculating(false);
            }
            return;
        }

        // 3. Fallback: Prompt for input
        setShowInput(true);
        setCalculating(false);
    };

    // Google Maps Embed URL - Centered on Sri Lanka or specific branch
    // Using a general view of Sri Lanka if no specific nearest branch selected, or the nearest one.
    const getMapUrl = () => {
        if (userLocation && sortedBranches.length > 0) {
            // Focus on nearest branch
            const nearest = sortedBranches[0];
            return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63320.41806364028!2d${nearest.lng}!3d${nearest.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMjInNDkuMSJOIDgwwrAyNCcyNS4yIkU!5e0!3m2!1sen!2slk!4v1620000000000!5m2!1sen!2slk`;
        }
        // Default View (Sri Lanka / Kilinochchi)
        return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126593.477618970!2d80.3500!3d9.3803!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afe541094da55c1%3A0x6a04149206674699!2sKilinochchi!5e0!3m2!1sen!2slk!4v1715600000000!5m2!1sen!2slk";
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm mb-8">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <MapPin className="text-emerald-500" /> Branch Network
                </h3>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {showInput ? (
                        <div className="flex w-full sm:w-auto gap-2">
                            <input
                                type="text"
                                placeholder="Enter your city..."
                                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500 w-full sm:w-48"
                                value={manualCity}
                                onChange={(e) => setManualCity(e.target.value)}
                                list="sl-cities"
                            />
                            <datalist id="sl-cities">
                                {slCities.map((city, i) => <option key={i} value={city.name} />)}
                            </datalist>
                            <button
                                onClick={handleCalculateLocation}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap"
                            >
                                Go
                            </button>
                        </div>
                    ) : (
                        !userLocation && (
                            <button
                                onClick={handleCalculateLocation}
                                disabled={calculating}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                            >
                                {calculating ? 'Processing...' : 'Find Nearest Branch'}
                            </button>
                        )
                    )}

                    {userLocation && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">Near: <b>{userLocation.name || 'Unknown'}</b></span>
                            <button onClick={() => { setUserLocation(null); setShowInput(true); setManualCity(''); }} className="text-xs text-emerald-600 hover:underline">Change</button>
                        </div>
                    )}
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs px-6 py-2">
                    {errorMsg}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Branch List */}
                <div className="p-6 lg:border-r border-gray-100 dark:border-gray-800 max-h-[400px] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        {sortedBranches.map((branch, i) => (
                            <div key={i} className={`p-4 rounded-xl border transition-all cursor-pointer ${i === 0 && userLocation ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 shadow-sm' : 'bg-gray-50 dark:bg-gray-800/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-bold text-sm mb-1 ${i === 0 && userLocation ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{branch.name}</h4>
                                    {branch.distance && (
                                        <span className="text-[10px] font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                            {branch.distance.toFixed(1)} km
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{branch.address}</p>

                                <div className="flex gap-2">
                                    {i === 0 && userLocation ? (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <MapPin size={10} /> Nearest Branch
                                        </span>
                                    ) : (
                                        branch.type === 'Main Office' && <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">● Main Office</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Map Display */}
                <div className="lg:col-span-2 bg-slate-50 dark:bg-[#0c1222] relative min-h-[300px]">
                    <iframe
                        src={getMapUrl()}
                        className="w-full h-full absolute inset-0 border-0"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Branch Map"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default BranchMap;
