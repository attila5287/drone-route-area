import './App.css'
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "bootswatch/dist/slate/bootstrap.min.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// import { testpoly } from "./testdata";
// import { blankpoly } from "./blankpoly";
import InputPanel from "./components/InputPanel";
import Map from "./Map";




function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Map/>
    </>
  )
}

export default App
