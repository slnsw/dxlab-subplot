import './App.css';

import React from 'react';
import { MapExplorer } from './components/MapExplorer';

import { MapsProvider } from './context/MapsProvider'
import { SocketProvider } from './context/SocketContext'

import { Route, Switch, BrowserRouter } from 'react-router-dom'

function App() {

  const initial = {
    years: {
      from: 1880,
      to: 1890
    },
    assetIds: null,
    around: null,
    aroundRadius: 1000,
  }



  return (
    <React.Fragment>
      <BrowserRouter>
        <SocketProvider>
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
        </SocketProvider>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
