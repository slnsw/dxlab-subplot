import React, {useState} from 'react';
import { MapExplorer } from './components/MapExplorer';

import './App.css';

// Data vizualization and info layers
import {LandmarksLayer} from './components/layers/LandmarksLayer';
import {FootprintMapsLayer} from './components/layers/FootprintMapsLayer';
import {SearchResultLayer} from './components/layers/SearchResultLayer';

// Temporal
import { MapDataService } from './share/services';

function App() {

  // Temporal - Begin
  const [state, setstate] = useState({
    around: null,
    roiArea: null
  });

  const dataService = new MapDataService();

  const onResult = (event)  => {
// 
  };

  const onViewChange = ({latitude, longitude, zoom})  => {
    const geometry = {
      type: 'Point',
      coordinates: [longitude, latitude]
    }

    const data = dataService.fetch({
      around: geometry,
      aroundRadius: 2000 //300 * (20 - zoom)
    })

    setstate({
      roiArea: {
        type: 'Feature',
        geometry: geometry,
        properties: {
            'zoom': zoom,
        }
      },
      mapData: data
    });


  };
  // Temporal - End

  const layers = [
    new LandmarksLayer({}),
    new SearchResultLayer({
      data: state.roiArea
    }),
    new FootprintMapsLayer({
      data: state.mapData,
    })
  ];


  return (
    <React.Fragment>
        <MapExplorer 
          layers={layers}
          onResult={onResult}
          onViewChange={onViewChange}
        ></MapExplorer>
    </React.Fragment>
  );
}

export default App;
