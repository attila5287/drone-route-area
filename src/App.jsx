import './App.css'
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import MapBoxExample from './Map.jsx';
import "bootswatch/dist/slate/bootstrap.min.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYXR0aWxhNTIiLCJhIjoiY2thOTE3N3l0MDZmczJxcjl6dzZoNDJsbiJ9.bzXjw1xzQcsIhjB_YoAuEw";
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <MapBoxExample token={MAPBOX_ACCESS_TOKEN}/>
    </>
  )
}

export default App
