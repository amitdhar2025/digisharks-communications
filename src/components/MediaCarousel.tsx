"use client";

import { useState } from "react";

interface MediaHouseItem {
  image?: string;
  caption?: string;
  alt?: string;
  link?: string;
  isActive?: boolean;
  order?: number;
}

interface MediaHouse {
  icon?: string;
  name: string;
  image?: string;
}

const DEFAULT_MEDIA_HOUSES = [
  { icon: "📰", caption: "The Hindu" },
  { icon: "📺", caption: "NDTV" },
  { icon: "📡", caption: "Times of India" },
  { icon: "🌐", caption: "Hindustan Times" },
  { icon: "📻", caption: "Aaj Tak" },
  { icon: "💼", caption: "Business Standard" },
  { icon: "📱", caption: "India Today" },
  { icon: "🌍", caption: "The Indian Express" },
  { icon: "🎤", caption: "ANI News" },
  { icon: "📊", caption: "Forbes India" },
  { icon: "🎬", caption: "Economic Times" },
  { icon: "💻", caption: "LiveMint" },
];

export default function MediaCarousel({ items = [] }: { items?: MediaHouseItem[] }) {
  const [isPaused, setIsPaused] = useState(false);

  // Use CMS items if available, otherwise fallback to hardcoded
  const mediaHouses: MediaHouse[] = (() => {
    const activeItems = items
      .filter((item: MediaHouseItem) => item.isActive !== false)
      .sort((a: MediaHouseItem, b: MediaHouseItem) => (a.order ?? 0) - (b.order ?? 0));
    if (activeItems.length > 0) {
      return activeItems.map((item: MediaHouseItem) => ({
        image: item.image,
        name: item.caption || item.alt || "Media House",
      }));
    }
    return DEFAULT_MEDIA_HOUSES.map((m) => ({
      icon: m.icon,
      name: m.caption,
    }));
  })();

  // Triple the items for seamless infinite scroll
  const displayItems = [...mediaHouses, ...mediaHouses, ...mediaHouses];

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
        .media-house-logo-img {
          width: 28px;
          height: 28px;
          object-fit: contain;
          border-radius: 4px;
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
          {displayItems.map((item, i) => (
            <div key={i} className="media-logo carousel-item">
              {item.image ? (
                <img src={item.image} alt={item.name} className="media-house-logo-img" />
              ) : (
                <span className="media-logo-icon">{item.icon || "📰"}</span>
              )}
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}