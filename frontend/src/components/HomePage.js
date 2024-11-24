import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [comicData, setComicData] = useState({ title: '', image_url: '' });
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    axios.get(`${apiBaseUrl}/`)
      .then(response => {
        const { title, image_url } = response.data;
        setComicData({ title, image_url });
      })
      .catch(error => {
        console.error('Error fetching the comic data:', error);
      });
  }, [apiBaseUrl]);

  return (
    <div className="container">
      <Helmet>
        <title>Lauren's Daily</title>
        <meta name="description" content="Lauren's Daily" />
        {comicData.title && <meta property="og:title" content={comicData.title} />}
        {comicData.image_url && <meta property="og:image" content={comicData.image_url} />}
        <meta property="og:description" content="Check out the latest comic on Lauren's Daily!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <h1 className="title">Lauren's Daily</h1>
      {comicData.title && <p className="comicTitle">{comicData.title}</p>}
      <div className="comicWrapper">
        {comicData.image_url && (
          <img
            src={comicData.image_url}
            alt={comicData.title}
            className="comic"
            onError={(e) => {
              console.error('Error loading comic image:', e);
              e.target.style.display = 'none';
            }}
            onLoad={() => console.log('Comic image loaded successfully')}
          />
        )}
      </div>
      <p className="signature">Love, Jackson</p>
    </div>
  );
};

export default HomePage;
