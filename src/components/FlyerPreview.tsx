import React from 'react';
import { FlyerData } from '../types';

interface FlyerPreviewProps {
  data: FlyerData;
  className?: string;
  id?: string;
}

const FlyerPreview: React.FC<FlyerPreviewProps> = ({ data, className = '', id }) => {
  return (
    <div 
      id={id}
      className={`flyer-preview ${className}`}
      style={{
        backgroundColor: '#231F20',
        color: '#caa12b',
        fontFamily: "'Oswald', Impact, 'Arial Narrow', sans-serif",
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1rem',
        minHeight: '300px'
      }}
    >
      <div className="flyer-content h-100 d-flex flex-column">
        <header className="text-center mb-3">
          <img 
            src="/logo.png" 
            alt="Matt Monroe Logo" 
            className="img-fluid"
            style={{ maxHeight: '60px', width: 'auto' }}
          />
        </header>
        
        <div className="flex-grow-1 d-flex flex-column justify-content-center text-center">
          <section 
            id={id ? `date-${id}` : 'date'} 
            className="mb-3"
            style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1.1' }}
          >
            {data.date}
          </section>
          
          <section 
            id={id ? `venue_name-${id}` : 'venue_name'} 
            className="mb-3"
            style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1.2' }}
          >
            {data.venueName}
          </section>
          
          <section 
            id={id ? `venue_address-${id}` : 'venue_address'} 
            className="mb-2"
            style={{ color: 'white', fontSize: '1.25rem', lineHeight: '1.3' }}
          >
            {data.venueAddress}
            {data.cityState && <><br />{data.cityState}</>}
          </section>
          
          <section 
            id={id ? `show_time-${id}` : 'show_time'} 
            className="mb-2"
            style={{ color: 'white', fontSize: '1.25rem', lineHeight: '1.3' }}
          >
            {data.showTime}
          </section>
          
          <section 
            id={id ? `event_type-${id}` : 'event_type'} 
            style={{ fontSize: '1.1rem', fontWeight: '600', lineHeight: '1.4' }}
          >
            {data.eventType}
          </section>
        </div>
      </div>
    </div>
  );
};

export default FlyerPreview;

