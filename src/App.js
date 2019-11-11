import './App.scss';

import React from 'react';
import { MapExplorer } from './components/MapExplorer';

import { MapsProvider } from './context/MapsContext';

import { Route, Switch, BrowserRouter } from 'react-router-dom';

function App() {

  const initial = {
    maps: {
      data: [],
      filter: {
        fromYear: 1880,
        toYear: 1980,
        assetIds: null,
        around: null,
        aroundRadius: null
      }
    },
    comm: {

    }
  }



  return (
    <React.Fragment>
      <BrowserRouter>
          <MapsProvider {...initial}>

            <Switch>
              <Route exact path="/">

                <MapExplorer mode='kiosk' />
              
              </Route>
              
              <Route exact path="/master">
                <MapExplorer mode='master' />
              </Route>

              <Route exact path="/slave">
                <MapExplorer mode='slave' />
              </Route>

            </Switch>

          </MapsProvider>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
