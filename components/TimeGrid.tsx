import React, { useState } from 'react';
import { City } from '../lib/CityLink';
import LocationRow from './LocationRow';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import './TimeGrid.css';

interface Props {
    cities: City[];
    onRemove: (id: string) => void;
    onReorder: (fromIndex: number, toIndex: number) => void;
    citySearch: React.ReactNode;
}

const TimeGrid: React.FC<Props> = ({ cities, onRemove, onReorder, citySearch }) => {
    const homeCity = cities[0];
    const [hoveredHourIndex, setHoveredHourIndex] = useState<number | null>(null);
    const [pinnedColumnIndex, setPinnedColumnIndex] = useState<number | null>(0);
    const [isExactTime, setIsExactTime] = useState(true); // Default to exact time (Now)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    // Track offset from "Now" in hours. 0 = Current hour is start.
    const [gridOffset, setGridOffset] = useState(0);

    if (cities.length === 0) return <div>Add a city to start</div>;

    const homeTime = DateTime.now().setZone(homeCity.timezone);
    // Base start hour is current hour + valid gridOffset
    const startHour = homeTime.startOf('hour').plus({ hours: gridOffset });

    const handleNav = (direction: 'left' | 'right') => {
        setGridOffset(prev => prev + (direction === 'left' ? -1 : 1));
    };

    const handleCellClick = (columnIndex: number) => {
        setPinnedColumnIndex(columnIndex);
        setIsExactTime(false); // Manual selection is not "exact time" mode (it's block mode)
    };

    const handleResetToNow = () => {
        setGridOffset(0);
        setPinnedColumnIndex(0);
        setIsExactTime(true);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== dropIndex) {
            onReorder(draggedIndex, dropIndex);
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="time-grid-wrapper">
            <div className="time-grid-container" onMouseLeave={() => setHoveredHourIndex(null)}>
                {cities.map((city, index) => (
                    <LocationRow
                        key={city.id}
                        city={city}
                        isHome={index === 0}
                        homeStartHour={startHour}
                        onRemove={() => onRemove(city.id)}
                        hoveredIndex={hoveredHourIndex}
                        onHoverIndex={setHoveredHourIndex}
                        pinnedColumnIndex={pinnedColumnIndex}
                        onCellClick={handleCellClick}
                        draggable={true}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedIndex === index}
                        showDropIndicator={dragOverIndex === index && draggedIndex !== index}
                        isExactTime={isExactTime}
                    />
                ))}
            </div>

            <div className="grid-controls">
                {citySearch}

                <button className="nav-arrow nav-left" onClick={() => handleNav('left')} title="-1 Hour">
                    <ChevronLeft size={24} />
                </button>


                <button
                    className={`now-reset-btn ${gridOffset === 0 && pinnedColumnIndex === 0 ? 'disabled' : ''}`}
                    onClick={handleResetToNow}
                    title="Reset to current time"
                    disabled={gridOffset === 0 && pinnedColumnIndex === 0}
                >
                    <RotateCcw size={18} />
                    <span>Now</span>
                </button>


                <button className="nav-arrow nav-right" onClick={() => handleNav('right')} title="+1 Hour">
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
};

export default TimeGrid;
