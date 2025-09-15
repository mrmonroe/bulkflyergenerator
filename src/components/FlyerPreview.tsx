import React from 'react';
import { FlyerData } from '../types';
import './FlyerPreview.css';

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
        fontFamily: "'Oswald', Impact, 'Arial Narrow', sans-serif"
      }}
    >
      <div className="flyer-content">
        <header>
          <img src="/logo.png" alt="Matt Monroe Logo" className="logo-image" />
        </header>
        
        <section id={id ? `date-${id}` : 'date'} className="size-xxl">
          {data.date}
        </section>
        
        <section id={id ? `venue_name-${id}` : 'venue_name'} className="size-xl">
          {data.venueName}
        </section>
        
        <section id={id ? `venue_address-${id}` : 'venue_address'} className="white_text size-lg">
          {data.venueAddress}
          {data.cityState && <><br />{data.cityState}</>}
        </section>
        
        <section id={id ? `show_time-${id}` : 'show_time'} className="white_text size-lg">
          {data.showTime}
        </section>
        
        <section id={id ? `event_type-${id}` : 'event_type'} className="size-md">
          {data.eventType}
        </section>
      </div>
    </div>
  );
};

export default FlyerPreview;
