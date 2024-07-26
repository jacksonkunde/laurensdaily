import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5002/comic')
      .then(response => {
        setTitle(response.data.title);
      })
      .catch(error => {
        console.error('Error fetching the comic title:', error);
      });
  }, []);

  return (
    <div className="container">
      <h1 className="title">Lauren's Daily</h1>
      {title && <p className="comicTitle">{title}</p>}
      <div className="comicWrapper">
        <img
          src="http://localhost:5002/daily_comic"
          alt={title}
          className="comic"
          onError={(e) => {
            console.error('Error loading comic image:', e);
            e.target.style.display = 'none';
          }}
          onLoad={() => console.log('Comic image loaded successfully')}
        />
      </div>
      <p className="signature">Love, Jackson</p>
    </div>
  );
};

export default HomePage;
