import React, { useState } from 'react';
import { City } from '../lib/CityLink';
import LocationRow from './LocationRow';
import { DateTime } from 'luxon';
import { ChevronLeft, ChevronRight, RotateCcw, ChevronsLeft, ChevronsRight } from 'lucide-react';
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
    const [touchDragIndex, setTouchDragIndex] = useState<number | null>(null);

    // Track offset from "Now" in hours. 0 = Current hour is start.
    const [gridOffset, setGridOffset] = useState(0);

    if (cities.length === 0) return <div>Add a city to start</div>;

    const homeTime = DateTime.now().setZone(homeCity.timezone);
    // Base start hour is current hour + valid gridOffset
    const startHour = homeTime.startOf('hour').plus({ hours: gridOffset });

    const handleNav = (direction: 'left' | 'right' | 'day-left' | 'day-right') => {
        let change = 0;
        if (direction === 'left') change = -1;
        if (direction === 'right') change = 1;
        if (direction === 'day-left') change = -24;
        if (direction === 'day-right') change = 24;

        setGridOffset(prev => prev + change);
        setIsExactTime(false);
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

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        if (!dateValue) return;

        // Current view time (start of the grid)
        const currentViewTime = homeTime.startOf('hour').plus({ hours: gridOffset });

        // Create target date with same time as current view
        // e.target.value is YYYY-MM-DD
        const targetDate = DateTime.fromISO(dateValue, { zone: homeCity.timezone })
            .set({
                hour: currentViewTime.hour,
                minute: currentViewTime.minute
            });

        // Calculate difference in hours between target and "Now" (base homeTime)
        // We need to update gridOffset such that startHour becomes targetDate
        // startHour = homeTime.startOf('hour').plus({ hours: gridOffset })
        // We want newStartHour ~ targetDate
        // So newGridOffset = targetDate.diff(homeTime.startOf('hour'), 'hours').hours

        const diffHours = targetDate.diff(homeTime.startOf('hour'), 'hours').hours;
        setGridOffset(Math.round(diffHours));
        setIsExactTime(false);
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

    // Touch drag handlers for mobile
    const handleTouchDragStart = (index: number) => {
        setTouchDragIndex(index);
    };

    const handleTouchDragMove = (index: number, clientY: number) => {
        // Find which row the touch is over  
        const rows = document.querySelectorAll('.location-row');
        let targetIndex = index; // default to same row

        rows.forEach((row, idx) => {
            const rect = row.getBoundingClientRect();
            if (clientY >= rect.top && clientY <= rect.bottom) {
                targetIndex = idx;
            }
        });

        setDragOverIndex(targetIndex);
    };

    const handleTouchDragEnd = () => {
        if (touchDragIndex !== null && dragOverIndex !== null && touchDragIndex !== dragOverIndex) {
            onReorder(touchDragIndex, dragOverIndex);
        }
        setTouchDragIndex(null);
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
                        isDragging={draggedIndex === index || touchDragIndex === index}
                        showDropIndicator={dragOverIndex === index && (draggedIndex !== index && touchDragIndex !== index)}
                        isExactTime={isExactTime}
                        onTouchDragStart={index !== 0 ? () => handleTouchDragStart(index) : undefined}
                        onTouchDragMove={index !== 0 ? (clientY) => handleTouchDragMove(index, clientY) : undefined}
                        onTouchDragEnd={index !== 0 ? handleTouchDragEnd : undefined}
                    />
                ))}
            </div>

            <div className="grid-controls">
                {citySearch}




                <div className="nav-controls">
                    <button className="nav-arrow" onClick={() => handleNav('day-left')} title="-1 Day">
                        <ChevronsLeft size={20} />
                    </button>
                    <button className="nav-arrow" onClick={() => handleNav('left')} title="-1 Hour">
                        <ChevronLeft size={24} />
                    </button>
                </div>


                <button
                    className={`now-reset-btn ${gridOffset === 0 && pinnedColumnIndex === 0 ? 'disabled' : ''}`}
                    onClick={handleResetToNow}
                    title="Reset to current time"
                    disabled={gridOffset === 0 && pinnedColumnIndex === 0}
                >
                    <RotateCcw size={18} />
                    <span>Now</span>
                </button>

                <input
                    type="date"
                    className="date-picker-input"
                    value={startHour.toFormat('yyyy-MM-dd')}
                    onChange={handleDateChange}
                />


                <div className="nav-controls">
                    <button className="nav-arrow" onClick={() => handleNav('right')} title="+1 Hour">
                        <ChevronRight size={24} />
                    </button>
                    <button className="nav-arrow" onClick={() => handleNav('day-right')} title="+1 Day">
                        <ChevronsRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeGrid;
