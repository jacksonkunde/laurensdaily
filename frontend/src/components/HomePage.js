import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HomePage.css';

const HomePage = () => {
  const [comicData, setComicData] = useState({ title: '', image_url: '' });
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    // Fetch comic data from API
    axios.get(`${apiBaseUrl}/`)
      .then(response => {
        const { title, image_url } = response.data;
        setComicData({ title, image_url });

        // Dynamically update the document head with Open Graph and Twitter metadata
        if (title) {
          document.title = `Lauren's Daily: ${title}`;
          updateMetaTag('property', 'og:title', title);
          updateMetaTag('name', 'twitter:title', title);
        }
        if (image_url) {
          updateMetaTag('property', 'og:image', image_url);
          updateMetaTag('name', 'twitter:image', image_url);
        }

        // Common metadata for all pages
        updateMetaTag('property', 'og:description', 'Check out the latest comic on Lauren\'s Daily!');
        updateMetaTag('name', 'twitter:description', 'Check out the latest comic on Lauren\'s Daily!');
        updateMetaTag('property', 'og:type', 'website');
        updateMetaTag('property', 'og:url', window.location.href);
        updateMetaTag('name', 'twitter:card', 'summary_large_image'); // Large image preview on Twitter
      })
      .catch(error => {
        console.error('Error fetching the comic data:', error);
      });
  }, [apiBaseUrl]);

  // Helper function to update or create meta tags
  const updateMetaTag = (key, name, content) => {
    let tag = document.querySelector(`meta[${key}="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(key, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  return (
    <div className="container">
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
