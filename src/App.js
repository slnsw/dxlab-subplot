import React, { useState } from 'react';
import { MapExplorer } from './components/MapExplorer';

import './App.css';

import { MapsProvider } from './context/MapsProvider'

// Data vizualization and info layers
import { LandmarksLayer } from './components/layers/LandmarksLayer';
import { FootprintMapsLayer } from './components/layers/FootprintMapsLayer';
import { SearchResultLayer } from './components/layers/SearchResultLayer';
import { MapsDistributionLayer } from './components/layers/MapsDistributionLayer';
import { MapsPolygonLayer } from './components/layers/MapsPolygonLayer';
import { MapsBitmapLayer } from './components/layers/MapsBitmapLayer';


function App() {

  const initial = {
      years: {
        from: 1880,
        to: 1950
      },
      assetIds: null,
      around: null,
      aroundRadius: 2000, 
  }  
  




  return (
    <React.Fragment>
      <MapsProvider {...initial}>
        <MapExplorer/>
      </MapsProvider>
    </React.Fragment>
  );
}

export default App;
