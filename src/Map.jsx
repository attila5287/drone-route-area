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
import { ExtrusionPaint } from './config/ExtrusionPaint.jsx';
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

  // Update layers function
  const updateLayers = (polygonData) => {
    if (mapRef.current && mapRef.current.isStyleLoaded() && polygonData && polygonData.features.length > 0) {
      try {
        // Update blue extrusion layer
        const userExtrusionSource = mapRef.current.getSource("user-extrusion-src");
        if (userExtrusionSource) {
          userExtrusionSource.setData(polygonData);
        }
        
        // Update line layer with route
        const areaLineSource = mapRef.current.getSource("area-line-src");
        if (areaLineSource) {
          const updatedRoute = AreaRoute(polygonData, userInput);
          areaLineSource.setData(updatedRoute);
        }
        
        // Update blue extrusion height based on minimum elevation
        if (mapRef.current.getLayer("user-extrusion")) {
          const { elevationStart, elevationMid, elevationEnd } = userInput;
          const minElevation = Math.min(elevationStart, elevationMid, elevationEnd);
          const blueExtrusionHeight = Math.max(1, minElevation - 1);
          
          mapRef.current.setPaintProperty(
            "user-extrusion",
            "fill-extrusion-height",
            blueExtrusionHeight
          );
        }
        
        mapRef.current.triggerRepaint();
      } catch (error) {
        console.warn("Error updating layers:", error);
      }
    }
  };

  // Update layers when userInput changes
  useEffect(() => {
    if (drawRef.current && mapRef.current && mapRef.current.isStyleLoaded()) {
      try {
        const data = drawRef.current.getAll();
        if (data && data.features.length > 0) {
          updateLayers(data);
        } else {
          // Use testPolygon as fallback when no user drawing
          updateLayers(testPolygon);
        }
      } catch (error) {
        console.warn("Error in userInput effect:", error);
        // If draw is not ready yet, use testPolygon
        updateLayers(testPolygon);
      }
    }
  }, [userInput]);

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

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
        combine_features: true,
        uncombine_features: true,
      },
      defaultMode: "draw_polygon",
    });
    drawRef.current = draw;
    mapRef.current.addControl(draw);

    mapRef.current.on('draw.create', updateArea);
    mapRef.current.on('draw.delete', updateArea);
    mapRef.current.on('draw.update', updateArea);

    function updateArea(e) {
      if (!drawRef.current) return;
      
      const data = drawRef.current.getAll();
      if (data.features.length > 0) {
        const area = turf.area(data);
        setRoundedArea( Math.round( area * 100 ) / 100 );
        console.log(data);
        
        // Update both extrusion and line layers with user-drawn polygon
        updateLayers(data);
      } else {
        setRoundedArea();
        
        // When user deletes all drawings, revert to testPolygon
        updateLayers(testPolygon);
        
        if (e.type !== 'draw.delete') alert('Click the map to draw a polygon.');
      }
    }

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
         mapRef.current.addSource("agri-field-src2", {
           type: "geojson",
           data: testAgriField2,
         });

         mapRef.current.addLayer({
           id: "agri-field-extrusion2",
           type: "fill-extrusion",
           source: "agri-field-src2",
           paint: {
             "fill-extrusion-color": "olive",
            //  "fill-extrusion-height": 20,
             "fill-extrusion-base": 0,
             "fill-extrusion-opacity": 0.8,
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
           paint:ExtrusionPaint,
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