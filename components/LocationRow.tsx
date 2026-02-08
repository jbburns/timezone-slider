import React from 'react';
import { City } from '../lib/CityLink';
import { DateTime } from 'luxon';
import { Trash2, Home } from 'lucide-react';
import { TimeEngine } from '../lib/TimeEngine';
import { getTimezoneAbbreviation } from '../lib/timezoneAbbrev';

interface Props {
    city: City;
    isHome: boolean;
    homeStartHour: DateTime;
    onRemove: () => void;
    hoveredIndex: number | null;
    onHoverIndex: (index: number | null) => void;
    pinnedTime: DateTime | null;
    onCellClick: (cellTime: DateTime) => void;
    draggable: boolean;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    isDragging: boolean;
    showDropIndicator: boolean;
}

const LocationRow: React.FC<Props> = ({
    city, isHome, homeStartHour, onRemove, hoveredIndex, onHoverIndex, pinnedTime, onCellClick,
    draggable, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, isDragging, showDropIndicator
}) => {
    const cityNow = DateTime.now().setZone(city.timezone);

    const cells = Array.from({ length: 24 }, (_, i) => {
        const cellTimeAbsolute = homeStartHour.plus({ hours: i });
        return cellTimeAbsolute.setZone(city.timezone);
    });

    return (
        <div
            className={`location-row ${isHome ? 'is-home' : ''} ${isDragging ? 'dragging' : ''} ${showDropIndicator ? 'drop-target' : ''}`}
            draggable={draggable}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
        >
            {showDropIndicator && <div className="drop-indicator" />}
            <div className="city-info">
                <div className="city-header-row">
                    <span className="city-name-display">{city.name}</span>
                    {!isHome && (
                        <button onClick={onRemove} className="remove-btn" title="Remove city">
                            <Trash2 size={14} />
                        </button>
                    )}
                    {isHome && <Home size={14} className="home-icon" />}
                </div>
                <div className="city-meta-row">
                    <span className="city-abbrev">{getTimezoneAbbreviation(city.timezone)}</span>
                    <span className="city-offset">{cityNow.toFormat('Z')}</span>
                </div>
                <div className="city-time-display">
                    {pinnedTime
                        ? pinnedTime.setZone(city.timezone).toFormat('HH:mm')
                        : (hoveredIndex !== null
                            ? cells[hoveredIndex].toFormat('HH:mm')
                            : cityNow.toFormat('HH:mm')
                        )
                    }
                    <span className="city-date">
                        {pinnedTime
                            ? pinnedTime.setZone(city.timezone).toFormat('EEE, MMM d')
                            : (hoveredIndex !== null
                                ? cells[hoveredIndex].toFormat('EEE, MMM d')
                                : cityNow.toFormat('EEE, MMM d')
                            )
                        }
                    </span>
                </div>
            </div>

            <div className="time-strip" onMouseLeave={() => onHoverIndex(null)}>
                {cells.map((cellTime, i) => {
                    const isBusiness = TimeEngine.isBusinessHours(cellTime);
                    const isCurrentHour = cellTime.hasSame(DateTime.now(), 'hour');
                    const isHovered = hoveredIndex === i;
                    const isMidnight = cellTime.hour === 0;
                    const isPinned = pinnedTime && pinnedTime.hasSame(cellTime, 'hour');

                    return (
                        <div
                            key={i}
                            className={`time-cell 
                ${isBusiness ? 'business-hour' : 'off-hour'}
                ${isCurrentHour ? 'current-hour' : ''}
                ${isHovered ? 'hovered-column' : ''}
                ${isMidnight ? 'is-midnight' : ''}
                ${isPinned ? 'pinned' : ''}
              `}
                            onMouseEnter={() => onHoverIndex(i)}
                            onClick={() => onCellClick(cellTime)}
                        >
                            <span className="cell-label">{cellTime.toFormat('HH')}</span>
                            <span className="cell-day-label">{cellTime.hour === 0 ? cellTime.toFormat('MMM d') : ''}</span>

                            {/* "Now" Indicator Line (Only on current hour cell) */}
                            {isCurrentHour && <div className="now-indicator-line" />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LocationRow;
