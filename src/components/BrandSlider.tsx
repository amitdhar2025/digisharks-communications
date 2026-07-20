"use client";
import { useState } from "react";
const allImages = [1, 2, 3, 4, 5, 6, 7, 8];
const loop = allImages.concat(allImages);
export default function BrandSlider() {
  let [isHovered, setHovered] = useState(false);
  return (
    <div
      className="brand-carousel"
      onMouseEnter={function () { setHovered(true); }}
      onMouseLeave={function () { setHovered(false); }}
    >
      <div className="brand-carousel-track-overflow">
        <div className={"brand-carousel-track" + (isHovered ? " paused" : "")}>
          {loop.map(function (num, idx) {
            return (
              <div className="brand-carousel-item" key={"" + num + idx}>
                <img
                  src={"/one-card-" + num + ".avif"}
                  alt={"Project " + num}
                  width="160"
                  height="94"
                  className="brand-carousel-img"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}