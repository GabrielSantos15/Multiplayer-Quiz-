import { useRef, useState } from "react";
import countryShapes from "world-map-country-shapes";

const WORLD_VIEWBOX = "0 0 2000 1001";

export default function WorldMapQuestion({ highlightedCountry }: { highlightedCountry: string }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewBox, setViewBox] = useState(WORLD_VIEWBOX);

  function handleZoomToggle() {
    if (!isZoomed && pathRef.current) {
      const bbox = pathRef.current.getBBox();
      const padding = Math.max(bbox.width, bbox.height) * 0.4;

      setViewBox(
        `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`
      );
    } else {
      setViewBox(WORLD_VIEWBOX);
    }

    setIsZoomed((prev) => !prev);
  }

  return (
    <div>
      <svg viewBox={viewBox} style={{ transition: "all 0.5s ease" }}>
        {countryShapes.map((country) => (
          <path
            key={country.id}
            ref={country.id === highlightedCountry ? pathRef : undefined}
            d={country.shape}
            fill={country.id === highlightedCountry ? "#22c55e" : "#e5e7eb"}
            stroke="#ccc"
          />
        ))}
      </svg>

      <button onClick={handleZoomToggle}>
        {isZoomed ? "Ver mapa completo" : "Dar zoom no país"}
      </button>
    </div>
  );
}