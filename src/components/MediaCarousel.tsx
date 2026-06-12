"use client";

import { useState } from "react";

interface MediaHouse {
  icon: string;
  name: string;
}

const mediaHouses: MediaHouse[] = [
  { icon: "📰", name: "The Hindu" },
  { icon: "📺", name: "NDTV" },
  { icon: "📡", name: "Times of India" },
  { icon: "🌐", name: "Hindustan Times" },
  { icon: "📻", name: "Aaj Tak" },
  { icon: "💼", name: "Business Standard" },
  { icon: "📱", name: "India Today" },
  { icon: "🌍", name: "The Indian Express" },
  { icon: "🎤", name: "ANI News" },
  { icon: "📊", name: "Forbes India" },
  { icon: "🎬", name: "Economic Times" },
  { icon: "💻", name: "LiveMint" },
];

export default function MediaCarousel() {
  const [isPaused, setIsPaused] = useState(false);
  const items = [...mediaHouses, ...mediaHouses, ...mediaHouses];

  return (
    <div className="media-carousel-wrapper">
      <div className="media-logos-title">🏆 Featured In Top Media Houses Across India</div>

      <style>{`
        @keyframes mediaScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .carousel-track {
          display: flex;
          gap: 1rem;
          width: max-content;
          animation: mediaScroll 32s linear infinite;
          padding: 0.25rem 0;
        }
        .carousel-item {
          flex-shrink: 0;
          min-width: 170px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          cursor: default;
          transition: transform 0.25s ease, box-shadow 0.25s ease !important;
          position: relative;
          z-index: 1;
        }
        .carousel-item:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4) !important;
          z-index: 10;
        }
      `}</style>

      <div
        style={{ overflow: "hidden", width: "100%" }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="carousel-track"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {items.map((item, i) => (
            <div key={i} className="media-logo carousel-item">
              <span className="media-logo-icon">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}