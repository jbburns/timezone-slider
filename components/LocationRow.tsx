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
    pinnedColumnIndex: number | null;
    onCellClick: (columnIndex: number) => void;
    draggable: boolean;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
    isDragging: boolean;
    showDropIndicator: boolean;
    isExactTime: boolean;
}

const LocationRow: React.FC<Props> = ({
    city, isHome, homeStartHour, onRemove, hoveredIndex, onHoverIndex, pinnedColumnIndex, onCellClick,
    draggable, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd, isDragging, showDropIndicator, isExactTime
}) => {
    const cityNow = DateTime.now().setZone(city.timezone);

    // Calculate minute percentage for exact time line (0-100%)
    const currentMinutePct = (cityNow.minute / 60) * 100;

    const cells = Array.from({ length: 24 }, (_, i) => {
        const cellTimeAbsolute = homeStartHour.plus({ hours: i });
        return cellTimeAbsolute.setZone(city.timezone);
    });

    return (
        <div
            className={`location-row ${isHome ? 'is-home' : ''} ${isDragging ? 'dragging' : ''} ${showDropIndicator ? 'drop-target' : ''}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {showDropIndicator && <div className="drop-indicator" />}
            <div
                className="city-info"
                draggable={draggable}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            >
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
                    {pinnedColumnIndex !== null
                        ? (isExactTime
                            ? cityNow.toFormat('HH:mm')
                            : cells[pinnedColumnIndex].toFormat('HH:mm')
                        )
                        : (hoveredIndex !== null
                            ? cells[hoveredIndex].toFormat('HH:mm')
                            : cityNow.toFormat('HH:mm')
                        )
                    }
                    <span className="city-date">
                        {pinnedColumnIndex !== null
                            ? (isExactTime
                                ? cityNow.toFormat('EEE, MMM d')
                                : cells[pinnedColumnIndex].toFormat('EEE, MMM d')
                            )
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
                    // Pin highlight logic:
                    // If exact time mode: pin is only valid if it's the current hour (managed by parent mostly, but we verify)
                    // Actually, parent sets pinnedColumnIndex.
                    // IF isExactTime is true: we do NOT show the block 'pinned' style. We show the line.
                    // IF isExactTime is false: we show the block 'pinned' style.
                    const isPinnedColumn = pinnedColumnIndex === i;

                    const showBlockPin = isPinnedColumn && !isExactTime;
                    const showExactLine = isPinnedColumn && isExactTime;
                    // Note: isCurrentHour is not enough because grid might be scrolled. 
                    // But "Now" usually means "Current Time". 
                    // If we grid-scrolled away from "Now", pinnedColumnIndex might still be pointing to "Now" column?
                    // Actually, pinnedColumnIndex tracks the *visible column*.
                    // If we want "Now" line, it should be on the column that represents current hour.
                    // Users want "Now" button to reset to "Now".

                    return (
                        <div
                            key={i}
                            className={`time-cell 
                ${isBusiness ? 'business-hour' : 'off-hour'}
                ${isCurrentHour ? 'current-hour' : ''}
                ${isHovered ? 'hovered-column' : ''}
                ${isMidnight ? 'is-midnight' : ''}
                ${showBlockPin ? 'pinned' : ''}
              `}
                            onMouseEnter={() => onHoverIndex(i)}
                            onClick={() => onCellClick(i)}
                        >
                            <span className="cell-label">{cellTime.toFormat('HH')}</span>
                            <span className="cell-day-label">{cellTime.hour === 0 ? cellTime.toFormat('MMM d') : ''}</span>

                            {/* Exact Time Indicator Line */}
                            {showExactLine && (
                                <div
                                    className="now-indicator-line"
                                    style={{ left: `${currentMinutePct}%` }}
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LocationRow;
