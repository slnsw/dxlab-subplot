import React, { useEffect, useContext, useCallback, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'

import { MapDataContext } from './context/MapsContext'
import { UIContext } from './context/UIContext'
import { getMaps } from './context/MapsActions'
import { selectMap, goToViewState } from './context/UIActions'
import { MapExplorer } from './components/MapExplorer'

import { find, debounce } from 'lodash'

/**
 * Component to control URL deep linking of the
 * map explorer
 */
export const MapRoutes = () => {
  const [init, setInit] = useState(false)
  const [appMode, setAppMode] = useState('web')
  const [mapState, mapDispatch] = useContext(MapDataContext)
  const [uiState, uiDispatch] = useContext(UIContext)
  const { mode, range, location, id } = useParams()
  const history = useHistory()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _mapDispatch = useCallback(mapDispatch, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const _uiDispatch = useCallback(uiDispatch, [])

  // Update location history
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateHistory = useCallback(
    debounce((url) => {
      history.replace(url)
    }, 1000)
    , [])

  // Kick loading of the data as soon as the router path
  // is loaded
  useEffect(() => {
    // :/ refactor this only execute ones.
    if (!init) {
      const validModes = ['kiosk', 'web', '']
      let _mode = mode === undefined ? '' : mode
      if (validModes.includes(_mode)) {
        _mode = _mode === '' ? process.env.REACT_APP_DEFAULT_MODE : mode
        setAppMode(_mode)
      }

      let rangeQuery = {}
      if (range) {
        const years = range.split('-').map(y => parseInt(y))
        const [fromYear, toYear] = years
        // Validate max a min year
        rangeQuery = { fromYear, toYear }
      }

      // Load map data using URL path range
      _mapDispatch(getMaps(rangeQuery)).then(({ data }) => {
        setInit(true)

        // Use modal window
        if (id) {
          const select = find(data, ['properties.asset_id', id])
          _uiDispatch(selectMap({ ...select }))
        }
      })

      // Update location to URL
      if (location) {
        const bits = location.replace(/[@bp]/, '').split(',')
        const viewState = {
          latitude: parseFloat(bits[0]),
          longitude: parseFloat(bits[1]),
          zoom: parseFloat(bits[2]),
          bearing: parseFloat(bits[3]),
          pitch: parseFloat(bits[4])
        }
        _uiDispatch(goToViewState(viewState))
      }
    }
  }, [mode, range, id, location, _mapDispatch, _uiDispatch, init])

  //   Update URL path
  useEffect(() => {
    if (init) {
      // Build range
      const { fromYear, toYear } = mapState.filters
      const newRange = `${fromYear}-${toYear}`

      // Build location
      // console.log(uiState.viewState)
      const { latitude, longitude, zoom, bearing, pitch } = uiState.viewState || {}
      const newLocation = (latitude && longitude && zoom) ? `@${latitude},${longitude},${zoom.toFixed(2)}z,${bearing.toFixed(2)}b,${pitch.toFixed(2)}p` : undefined

      // Build view asset
      const { properties: { asset_id } = {} } = uiState.selected || {}

      // Build final URL
      const urlParts = [...(appMode !== 'web' ? [appMode] : []), newRange, newLocation, asset_id]
      const newUrl = `/${urlParts.filter(p => p).join('/')}`
      // console.log(newUrl)

      updateHistory(newUrl)
    }
  }, [mapState.filters, uiState.viewState, uiState.selected, init, history, id, appMode, location, updateHistory])

  useEffect(() => {
    if (appMode === 'kiosk') {
      const anchors = document.getElementsByTagName('a')
      for (var i = 0; i < anchors.length; i++) {
        const el = anchors[i]
        if (!el.getAttribute('block')) {
          el.setAttribute('block', true)
          el.onclick = () => { console.log('Kiosk mode'); return false }
        }
      }
    }
  }, [appMode, uiState])

  return (
    <>
      <MapExplorer mode={appMode} />
    </>
  )
}
