import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as turf from "@turf/turf";
import './assets/style.css';
import InputPanel from './InputPanel.jsx';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { testAgriField } from './data/testAgriField.js';
import { testAgriField2 } from './data/testAgriField2.js';
import { testPolygon } from './data/testdata.js';
import { AreaRoute } from './logic/AreaRoute.jsx';
import { DefaultUserInput } from './config/DefaultUserInput.jsx';

// console.log( testAgriField )
// console.log( testPolygon )
// console.log( AreaRoute( testPolygon, DefaultUserInput ) )


const MAP_CENTER = [27.14482, 38.42933];
const paragraphStyle = {
  fontFamily: 'monospace',
  margin: 0,
  fontSize: 11,
  padding: 2
};

const MapBoxExample = ({token}) => {
  const mapContainerRef = useRef();
  const mapRef = useRef();
  const drawRef = useRef();
  const [roundedArea, setRoundedArea] = useState();
  const [userInput, setUserInput] = useState(DefaultUserInput);

  const updateArea = (e) => {
    const data = drawRef.current.getAll();
    if (data && data.features && data.features.length > 0) {
      const area = turf.area(data);
      setRoundedArea( Math.round( area * 100 ) / 100 );
      console.log(data);
      
      // Update the blue extrusion source with drawn polygon data
      if (mapRef.current.getSource("user-extrusion-src")) {
        mapRef.current.getSource("user-extrusion-src").setData(data);
      }
      
      // Update the route line source with new user input
      if (mapRef.current.getSource("area-line-src")) {
        mapRef.current.getSource("area-line-src").setData(AreaRoute(data, userInput));
      }
    } else {
      setRoundedArea();
      // Clear the sources when no polygon is drawn
      if (mapRef.current.getSource("user-extrusion-src")) {
        mapRef.current.getSource("user-extrusion-src").setData({type: "FeatureCollection", features: []});
      }
      if (mapRef.current.getSource("area-line-src")) {
        mapRef.current.getSource("area-line-src").setData({type: "FeatureCollection", features: []});
      }
      if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
    }
  };

  useEffect(() => {
    mapRef.current = new mapboxgl.Map( {
      accessToken: token,
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

    drawRef.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
        combine_features: true,
        uncombine_features: true,
      },
      defaultMode: "draw_polygon",
    });
    mapRef.current.addControl(drawRef.current);

    mapRef.current.on('draw.create', updateArea);
    mapRef.current.on('draw.delete', updateArea);
    mapRef.current.on('draw.update', updateArea);

       mapRef.current.on( 'style.load', () => {
         console.log(mapRef.current.style.loaded());
         mapRef.current.addSource("agri-field-src", {
           type: "geojson",
           data: testAgriField,
         });

         mapRef.current.addLayer({
           id: "agri-field-extrusion",
           type: "fill-extrusion",
           source: "agri-field-src",
           paint: {
             "fill-extrusion-color": "darkgreen",
             "fill-extrusion-height": ["get", "elevation"],
             "fill-extrusion-base": 0,
             "fill-extrusion-opacity": 0.8,
           },
         });

         mapRef.current.addSource("agri-field2-src", {
           type: "geojson",
           data: testAgriField2,
         });

         mapRef.current.addLayer({
           id: "agri-field2-extrusion",
           type: "fill-extrusion",
           source: "agri-field2-src",
           paint: {
             "fill-extrusion-color": "olivedrab",
             "fill-extrusion-height": ["get", "elevation"],
             "fill-extrusion-base": 0,
             "fill-extrusion-opacity": 0.7,
           },
         });

         mapRef.current.addSource("user-extrusion-src", {
           type: "geojson",
           data: testPolygon,
         });

         mapRef.current.addLayer({
           id: "user-extrusion",
           type: "fill-extrusion",
           source: "user-extrusion-src",
           paint: {
             "fill-extrusion-height": 10,
             "fill-extrusion-base": 0,
             "fill-extrusion-color": "SkyBlue",
             "fill-extrusion-opacity": 0.5,
             "fill-extrusion-emissive-strength": 0.39,
             "fill-extrusion-flood-light-color": "DarkTurquoise",
             "fill-extrusion-flood-light-ground-radius": 0.5,
             "fill-extrusion-ambient-occlusion-wall-radius": 0,
             "fill-extrusion-ambient-occlusion-radius": 6.0,
             "fill-extrusion-ambient-occlusion-intensity": 0.9,
             "fill-extrusion-ambient-occlusion-ground-attenuation": 0.9,
             "fill-extrusion-vertical-gradient": false,
             "fill-extrusion-line-width": 0, //outwards like a wall
             "fill-extrusion-flood-light-wall-radius": 20,
             "fill-extrusion-flood-light-intensity": 0.9,
             "fill-extrusion-flood-light-ground-radius": 20,
             "fill-extrusion-cutoff-fade-range": 0,
             "fill-extrusion-rounded-roof": true,
             "fill-extrusion-cast-shadows": false,
           },
         });

         mapRef.current.addSource("area-line-src", {
           type: "geojson",
           data: AreaRoute(testPolygon, DefaultUserInput),
           lineMetrics: true,
         });
         // base config for 2 line layers hrz/vert
         const paintLine = {
           "line-emissive-strength": 1.0,
           "line-blur": 0.25,
           "line-width": 2.75,
           "line-color": "limegreen",
         };
         let layoutLine = {
           // shared layout between two layers
           "line-z-offset": [
             "at-interpolated",
             [
               "*",
               ["line-progress"],
               ["-", ["length", ["get", "elevation"]], 1],
             ],
             ["get", "elevation"],
           ],
           "line-elevation-reference": "sea",
           "line-cap": "round",
         };

         layoutLine["line-cross-slope"] = 0;
         mapRef.current.addLayer({
           id: `area-line-horizontal`,
           type: "line",
           source: `area-line-src`,
           layout: layoutLine,
           paint: paintLine,
         });

         // elevated-line-vert
         layoutLine["line-cross-slope"] = 1;
         mapRef.current.addLayer({
           id: `area-line-vertical`,
           type: "line",
           source: `area-line-src`,
           layout: layoutLine,
           paint: paintLine,
         });
       } );
    
    return () => {
      mapRef.current.remove();
    };
  }, []);

  // Update route when userInput changes (from InputPanel buttons)
  useEffect(() => {
    if (mapRef.current && mapRef.current.getSource("area-line-src")) {
      // Check if we have drawn data
      const drawnData = drawRef.current?.getAll();
      const hasDrawnPolygon = drawnData && drawnData.features && drawnData.features.length > 0;
      
      try {
        let routeData;
        if (hasDrawnPolygon) {
          routeData = AreaRoute(drawnData, userInput);
          console.log("Generated route from drawn polygon:", routeData);
        } else {
          routeData = AreaRoute(testPolygon, userInput);
          console.log("Generated route from test polygon:", routeData);
        }
        
        if (routeData && routeData.features) {
          mapRef.current.getSource("area-line-src").setData(routeData);
        }
      } catch (error) {
        console.warn("Error generating route:", error);
        // Don't clear the data, keep what we have
      }
    }
  }, [userInput]);

  return (
    <>
      <div ref={mapContainerRef} id="map" style={{ height: '100%' }}></div>
       
      <InputPanel userInput={userInput} setUserInput={setUserInput} />
       
      <div
        className="calculation-box bg-dark  text-secondary"
        style={{
          borderRadius: 10,
          opacity: 0.7,
          height:60,
          width: 150,
          position: 'absolute',
          bottom: 10,
          left: 140,
          padding: 2,
          textAlign: 'center'
        }}
      >
        <i className="fas fa-info-circle fa-pull-left text-xl m-1"></i>
        { !roundedArea && <p style={paragraphStyle}>Draw a polygon</p>}
        { roundedArea && <p style={paragraphStyle}>Select polygon to edit</p>}
        <div id="calculated-area">
          {roundedArea && (
            <>
              <p style={paragraphStyle}>
                <strong>{roundedArea} m²</strong>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default MapBoxExample;