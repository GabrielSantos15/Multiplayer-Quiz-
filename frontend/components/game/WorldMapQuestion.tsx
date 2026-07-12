"use client";

import { useMemo, useRef, useState } from "react";
import countryShapes from "world-map-country-shapes";

const WORLD_WIDTH = 2000;
const WORLD_HEIGHT = 1001;

type WorldMapQuestionProps = {
  highlightedCountry: string;
};

export default function WorldMapQuestion({
  highlightedCountry,
}: WorldMapQuestionProps) {
  const pathRef = useRef<SVGPathElement>(null);

  const [zoomed, setZoomed] = useState(false);

  const transform = useMemo(() => {
    if (!zoomed || !pathRef.current) {
      return "";
    }

    const bbox = pathRef.current.getBBox();

    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    const scale = Math.min(
      WORLD_WIDTH / (bbox.width * 4),
      WORLD_HEIGHT / (bbox.height * 4),
      8,
    );

    const translateX = WORLD_WIDTH / 2 - centerX * scale;
    const translateY = WORLD_HEIGHT / 2 - centerY * scale;

    return `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }, [zoomed]);

  return (
    <div className="space-y-4">
      <svg
        viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}
        className="w-full rounded-lg bg-slate-100"
      >
        <g
          style={{
            transition: "transform 600ms ease-in-out",
            transformOrigin: "0 0",
            transform,
          }}
        >
          {countryShapes.map((country) => (
            <path
              key={country.id}
              ref={
                country.id === highlightedCountry
                  ? pathRef
                  : undefined
              }
              d={country.shape}
              fill={
                country.id === highlightedCountry
                  ? "#22c55e"
                  : "#e5e7eb"
              }
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          ))}
        </g>
      </svg>

      <button
        onClick={() => setZoomed((prev) => !prev)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
      >
        {zoomed ? "Ver mapa completo" : "Dar zoom"}
      </button>
    </div>
  );
}