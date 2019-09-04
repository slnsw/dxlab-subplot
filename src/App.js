import React, { useState } from 'react';
import { MapExplorer } from './components/MapExplorer';

import './App.css';

import { MapsProvider } from './context/MapsProvider'

// Data vizualization and info layers
import { LandmarksLayer } from './components/layers/LandmarksLayer';
import { FootprintMapsLayer } from './components/layers/FootprintMapsLayer';
import { SearchResultLayer } from './components/layers/SearchResultLayer';
import { MapsDistributionLayer } from './components/layers/MapsDistributionLayer';
import { MapsPoligonLayer } from './components/layers/MapsPoligonLayer';
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

  // Note: DeckGL creates a custom React context for managing layers data
  // For that reason I am force to Initialize layers inside of the map explorer
  // them inject the custom MapContext. 

  // MapExplorer layers structure. [ Layer class, {props} ]
  // view == main or minimap or all
  // TODO: define a prop structure for this.
  const layers = [
    [SearchResultLayer, { view: 'all'}],
    [LandmarksLayer, { view: 'all'}],
    [MapsDistributionLayer, { view: 'minimap'}],
    [FootprintMapsLayer, { view: 'main'}],
    [MapsBitmapLayer, {name: 'crop', suffix: '_crop_800', view: 'main'}],
    // [MapsPoligonLayer, { view:'minimap'}]
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
