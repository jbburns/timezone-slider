import React from 'react';
import { Clock } from 'lucide-react';

const Header: React.FC = () => {
    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-md) 0',
            borderBottom: '1px solid var(--border-color)'
        }}>
            <Clock color="var(--primary-color)" />
            <h1 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Timezone Slider</h1>
        </header>
    );
};

export default Header;
