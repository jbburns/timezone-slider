import { useState, useEffect } from 'react';
import { getInitialHomeCity } from './lib/GeoUtils';
import { City } from './lib/CityLink';
import './index.css';
import './App.css';
import CitySearch from './components/CitySearch';
import TimeGrid from './components/TimeGrid';

function App() {
  const [cities, setCities] = useState<City[]>(() => {
    const saved = localStorage.getItem('timezone-slider-cities');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to recover cities", e);
      }
    }
    return [getInitialHomeCity()];
  });

  useEffect(() => {
    localStorage.setItem('timezone-slider-cities', JSON.stringify(cities));
  }, [cities]);

  const addCity = (city: City) => {
    if (!cities.find(c => c.timezone === city.timezone)) {
      setCities([...cities, city]);
    }
  };

  const removeCity = (id: string) => {
    setCities(cities.filter(c => c.id !== id));
  };

  const reorderCities = (fromIndex: number, toIndex: number) => {
    const newCities = [...cities];
    const [movedCity] = newCities.splice(fromIndex, 1);
    newCities.splice(toIndex, 0, movedCity);
    setCities(newCities);
  };

  return (
    <div className="app-container">
      {/* Header removed for minimalism */}
      <div className="main-content">
        <TimeGrid
          cities={cities}
          onRemove={removeCity}
          onReorder={reorderCities}
          citySearch={<CitySearch onSelect={addCity} />}
        />
      </div>
    </div>
  )
}

export default App;
