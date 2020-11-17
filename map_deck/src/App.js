import './App.scss'

import React from 'react'
import { Route, Switch, BrowserRouter } from 'react-router-dom'
import { createBrowserHistory as createHistory } from 'history'

import { MapsProvider } from './context/MapsContext'
import { UIProvider } from './context/UIContext'

import { MapRoutes } from './Routes'

// Only for S3 to allow deep linking
const history = createHistory()

const path = (/#!(\/.*)$/.exec(window.location.hash) || [])[1]
if (path) {
  history.replace(path)
}

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

              {/*
                - rage : from to year
                    format: {fromYear}-{toYear}
                    exp: \d{4}-\d{4}
                    eg: 1890-1897

                - location: geo coordinates of the view center of the map
                    format: {lan},{long},{zoom}p,{bearing}b,{pitch}p
                    exp: @-?\d+\.?\d+,-?\d+\.?\d+,\d{1,2}\.\d{2}z,-?\d{1,3}\.\d{2}b,\d{1,2}\.\d{2}p
                    eg: @-33.880633029261105,151.21576110579326,14.00z,-179.99b,55.00p

                - id : old id (extracted from Klokan)
                    format: {asset_id}
                    exp: [a-z]\d{7,9}
                    eg: a1367183 or c010440025

              */}

              <Route path='/:range(\d{4}-\d{4})?/:location(@-?\d+\.?\d+,-?\d+\.?\d+,\d{1,2}\.\d{2}z,-?\d{1,3}\.\d{2}b,\d{1,2}\.\d{2}p)?/:id([a-z]\d{7,9})?'>
                <MapRoutes />
              </Route>

              {/* <Route exact path='/'>
                <MapExplorer />
              </Route> */}

              {/*
              <Route exact path='/master'>
                <MapExplorer mode='master' />
              </Route>

              <Route exact path='/slave'>
                <MapExplorer mode='slave' />
              </Route> */}

            </Switch>
          </UIProvider>
        </MapsProvider>

      </BrowserRouter>
    </>
  )
}

export default App
