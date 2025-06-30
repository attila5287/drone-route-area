import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from "@turf/turf";

import InputPanel from './components/InputPanel';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
impo

const MAP_CENTER = [27.14482, 38.42933];
const paragraphStyle = {
  fontFamily: 'monospace',
  margin: 0,
  fontSize: 11,
  padding: 2
};

const Map = () => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const [roundedArea, setRoundedArea] = useState();

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYXR0aWxhNTIiLCJhIjoiY2thOTE3N3l0MDZmczJxcjl6dzZoNDJsbiJ9.bzXjw1xzQcsIhjB_YoAuEw';

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: MAP_CENTER,
      zoom: 18,
      bearing: 17,
      pitch: 65,
      config: {
        basemap: {
          lightPreset: "night",
        },
      },
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'draw_polygon'
    });
    mapRef.current.addControl(draw);

    mapRef.current.on('draw.create', updateArea);
    mapRef.current.on('draw.delete', updateArea);
    mapRef.current.on('draw.update', updateArea);

    function updateArea(e) {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const area = turf.area(data);
        setRoundedArea( Math.round( area * 100 ) / 100 );
        console.log(data.features[0].geometry.coordinates);
      } else {
        setRoundedArea();
        if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
      }
    }
  }, []);

  return (
    <>
      <div ref={mapContainerRef} id="map" style={{ height: '100%' }}></div>
      {/* {roundedArea && <InputPanel/>} */}
      <div
        className="calculation-box bg-dark  text-secondary"
        style={{
          borderRadius: 10,
          opacity: 0.7,
          height: 50,
          width: 150,
          position: 'absolute',
          bottom: 10,
          left: 140,
          padding: 10,
          textAlign: 'center'
        }}
      >
        <i className="fas fa-info-circle fa-pull-left text-lg"></i>
        { !roundedArea && <p style={paragraphStyle}>Draw a polygon</p>}
        { roundedArea && <p style={paragraphStyle}>Select polygon to edit vertices</p>}
        <div id="calculated-area">
          {roundedArea && (
            <>
              <p style={paragraphStyle}>
                <strong>{roundedArea}</strong>
              </p>
              <p style={paragraphStyle}>square meters</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Map;