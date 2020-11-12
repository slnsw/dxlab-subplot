import './App.scss'

import React from 'react'
import { Route, Switch, BrowserRouter } from 'react-router-dom'

import { MapExplorer } from './components/MapExplorer'
import { MapsProvider } from './context/MapsContext'
import { UIProvider } from './context/UIContext'

function App () {
  const initial = {
    filters: {
      fromYear: 1890, // 1894,
      toYear: 1897, // 1914,
      // colored: true,
      assetIds: null
    }

  }

  return (
    <>
      <BrowserRouter>
        <MapsProvider {...initial}>
          <UIProvider>
            <Switch>
              <Route exact path='/'>
                <MapExplorer mode='kiosk' />
              </Route>

              <Route exact path='/master'>
                <MapExplorer mode='master' />
              </Route>

              <Route exact path='/slave'>
                <MapExplorer mode='slave' />
              </Route>

            </Switch>
          </UIProvider>
        </MapsProvider>

      </BrowserRouter>
    </>
  )
}

export default App
