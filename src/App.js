import React, {useState} from 'react';
import { MapExplorer } from './components/MapExplorer';

import './App.css';

// Data vizualization and info layers
import {LandmarksLayer} from './components/layers/LandmarksLayer';
import {SearchResultLayer} from './components/layers/SearchResultLayer';



function App() {

  // Temporal - Begin
  const [state, setstate] = useState({
    around: null
  });

  const onResult = (event)  => {
    setstate({
      around: event.result.geometry
    })
  };
  // Temporal - End

  const layers = [
    new LandmarksLayer({}),
    new SearchResultLayer({
      data: state.around
    })
  ];


  return (
    <React.Fragment>
        <MapExplorer 
          layers={layers}
          onResult={onResult}
        ></MapExplorer>
    </React.Fragment>
  );
}

export default App;
