import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { CityLink, City } from '../lib/CityLink';
import './CitySearch.css';

interface Props {
    onSelect: (city: City) => void;
}

const CitySearch: React.FC<Props> = ({ onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<City[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length >= 2) {
            const hits = CityLink.search(val);
            setResults(hits);
            setIsOpen(true);
            setSelectedIndex(0); // Reset selection when results change
        } else {
            setResults([]);
            setIsOpen(false);
            setSelectedIndex(0);
        }
    };

    const selectCity = (city: City) => {
        onSelect(city);
        setQuery('');
        setIsOpen(false);
        setSelectedIndex(0);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || results.length === 0) return;

        if (e.key === 'Tab') {
            e.preventDefault(); // Prevent default tab behavior
            // Cycle through results
            setSelectedIndex((prev) => (prev + 1) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // If only one result, select it automatically
            // Otherwise, select the highlighted one
            const cityToSelect = results.length === 1 ? results[0] : results[selectedIndex];
            if (cityToSelect) {
                selectCity(cityToSelect);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="search-wrapper" ref={wrapperRef}>
            <div className="search-input-container">
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Add City (Major Tier 1 Cities Only)..."
                    value={query}
                    onChange={handleSearch}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="search-input"
                />
            </div>

            {isOpen && results.length > 0 && (
                <ul className="search-results">
                    {results.map((city, index) => (
                        <li
                            key={city.id}
                            onClick={() => selectCity(city)}
                            className={index === selectedIndex ? 'selected' : ''}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <span className="city-name">{city.name}</span>
                            <span className="city-meta">{city.country} • {city.timezone}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CitySearch;
