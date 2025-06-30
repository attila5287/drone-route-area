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
      <nav
        className="navbar navbar-expand navbar-dark bg-dark"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          height: "30px",
          padding: "5px",
        }}
      >
        <a className="navbar-brand" href="https://www.droneqube.com">
          <img
            src="/DRONEQUBE_LOGO.svg"
            alt="Logo"
            style={{ height: "12px" }}
          />
        </a>
        <a className="nav-item" href="https://www.droneqube.com">
          <i className="fas fa-wave-square mx-2"></i>
          <span className="navbar-text">Area Route</span>
        </a>
      </nav>
      <MapBoxExample token={MAPBOX_ACCESS_TOKEN} />
    </>
  );
}

export default App
