import './App.scss';

import React from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import { MapExplorer } from './components/MapExplorer';
import { MapsProvider } from './context/MapsContext';
import { UIProvider } from './context/UIContext';



function App() {

  const initial = {
    maps: {
      data: [],
      filters: {
        fromYear: 1880, //1894,
        toYear: 1900, //1914,
        // colored: true,
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
            <UIProvider>
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
            </UIProvider>
        </MapsProvider>

      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
