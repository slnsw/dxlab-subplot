import React, { useState } from 'react';
import { MapExplorer } from './components/MapExplorer';

import './App.css';

import { MapsProvider } from './context/MapsProvider'

// Data vizualization and info layers
import { LandmarksLayer } from './components/layers/LandmarksLayer';
import { FootprintMapsLayer } from './components/layers/FootprintMapsLayer';
import { SearchResultLayer } from './components/layers/SearchResultLayer';
import { MapsDistributionLayer } from './components/layers/MapsDistributionLayer';
import { MapsBitmapLayer } from './components/layers/MapsBitmapLayer';


function App() {

  const initial = {
      years: {
        from: 1880,
        to: 1950
      },
      assetIds: null,
      around: null,
      aroundRadius: 1000, 
  }

  // Note: DeckGL creates a custom React context for managing layers data
  // For that reason I am force to Initialize layers inside of the map explorer
  // them inject the custom MapContext. 

  // MapExplorer layers structure. [ Layer class, {props} ]
  // view == main or minimap or all
  // TODO: define a prop structure for this.
  const layers = [
    [SearchResultLayer, { view: 'main'}],
    [LandmarksLayer, { view: 'all'}],
    // [MapsDistributionLayer, { view: 'all'}],
    [FootprintMapsLayer, { view: 'all'}],
    [MapsBitmapLayer, {name: 'crop', suffix: '_crop_800', view: 'main'}],
    // [MapsBitmapLayer, {name: 'edge', suffix: '_edge_800', view: 'main'}],

  ];


  return (
    <React.Fragment>
      <MapsProvider {...initial}>
        <MapExplorer
          layers={layers}
        ></MapExplorer>
      </MapsProvider>
    </React.Fragment>
  );
}

export default App;
