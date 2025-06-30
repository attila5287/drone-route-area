"use strict";
import * as turf from "@turf/turf";
import { DefaultUserInput } from '../config/DefaultUserInput.jsx';

export const AreaRoute = ( polygon, userInput ) => {
    const { elevationStart, elevationMid, elevationEnd, stepCount , angleCourse = (90 * Math.PI) / 180 } = userInput || DefaultUserInput;
  
  console.log( userInput );
  console.log( polygon )

  // Check if polygon data is valid
  if (!polygon || !polygon.features || polygon.features.length === 0) {
    console.warn("No valid polygon data provided to AreaRoute");
    return { type: "FeatureCollection", features: [] };
  }

  const bbox = turf.bbox(polygon);
  const [minX, minY, maxX, maxY] = bbox;

  // Calculate step distance in degrees
  const bboxHeight = maxY - minY;
  const step = bboxHeight / stepCount;

  // Build horizontal lines
  const lines = [];
  for (let i = 0; i <= stepCount; i++) {
    const y = minY + i * step;
    const line = turf.lineString([
      [minX, y],
      [maxX, y],
    ]);
    lines.push(line);
  }

  // Rotate lines around bbox center if needed
  let rotated = turf.featureCollection(lines);
  if (angleCourse !== 0) {
    const center = turf.center(turf.bboxPolygon(bbox));
    rotated = turf.transformRotate(rotated, angleCourse, {
      pivot: center.geometry.coordinates,
    });
  }

  // Clip lines to polygon
  const clippedLines = rotated.features
    .map((line) => turf.lineIntersect(polygon, line))
    .filter((f) => f.features.length >= 2) // valid intersecting line
    .map((f) => {
      const coords = f.features.map((pt) => pt.geometry.coordinates);
      return turf.lineString(coords);
    });
  const zigzagLines = [];
  for (let i = 0; i < clippedLines.length; i++) {
    const current = clippedLines[i].geometry.coordinates;
    const reversed = [...current].reverse();
    const coords = i % 2 === 0 ? current : reversed;

    zigzagLines.push(turf.lineString(coords));

    // Add connecting leg (except after the last line)
    if (i < clippedLines.length - 1) {
      const next = clippedLines[i + 1].geometry.coordinates;
      const nextStart = i % 2 === 0 ? next[next.length - 1] : next[0];
      const currentEnd = coords[coords.length - 1];

      // Connect current end to next start
      zigzagLines.push(turf.lineString([currentEnd, nextStart]));
    }
  }
  // Merge all zigzag lines into one continuous LineString
  const allCoordinates = [];
  zigzagLines.forEach((line) => {
    allCoordinates.push(...line.geometry.coordinates);
  });
  
  const mergedLine = turf.lineString(allCoordinates);
  mergedLine.properties.elevation = [elevationStart, elevationMid, elevationEnd];
  
  console.log( "mergedLine", mergedLine );
  return turf.featureCollection([mergedLine]);
};
