import { ActionTypes } from './MapsReducer'
import { fetchData, loadData } from '../share/services'
import { pickBy, get, identity, some, map, isNumber, max, min } from 'lodash'
import { roundYearDown, roundYearUp } from './utils'

// Geolookups
import { GeoLookups } from '../share/utils/geospatial'

export function getMaps ({ ...query }) {
  return (dispatch, state) => (
    new Promise((resolve, reject) => {
      const filters = updateFilters(state.filters, { ...query })

      loadData()
        .then((data) => {
        // Get maximum and minimum year
          const years = map(data, 'properties.year').filter(d => isNumber(d) || !isNaN(d))
          data = (data) || []

          dispatch({
            type: ActionTypes.MAPS_DATA_COMPLETE,
            filters,
            // Full dataset
            dataSet: data,
            dataSetGeoIndex: new GeoLookups(data),

            // dataset filter by UI options and index
            ...filterData(data, filters),

            // General information of the dataset
            meta: {
              maxYear: roundYearUp(max(years)),
              minYear: roundYearDown(min(years))
            }
          })

          resolve()
        })
        .catch((error) => {
          dispatch({
            type: ActionTypes.MAPS_DATA_FAIL,
            error
          })
          reject(error)
        })
    })
  )
}

export function applyFilters ({ ...query }) {
  return (dispatch, state) => {
    const filters = updateFilters(state.filters, { ...query })
    const { data, geoIndex } = filterData(state.dataSet, filters)

    dispatch({
      type: ActionTypes.MAPS_FILTER_COMPLETE,
      filters,
      data,
      geoIndex
    })
  }
}

// export function getMapsWithin ({ center, radius = 2 }) {
//   return (dispatch, state) => {
//     const { dataIndex, dataSetIndex }

//     dispatch({
//       type: ActionTypes.MAPS_FILTER_COMPLETE,
//       filters,
//       data
//     })
//   }
// }

function updateFilters (current, { fromYear, toYear, assetIds, ...properties }) {
  return pickBy({
    ...current,
    ...(fromYear && { fromYear }),
    ...(toYear && { toYear }),
    ...properties
  }, identity)
}

function filterData (data, { fromYear, toYear, assetIds, ...properties }) {
  const filtered = data.filter((d) => {
    let select = true
    // Filter by range of years
    select = d.properties.year >= fromYear && d.properties.year <= toYear

    // Filter by exact match of other properties
    if (select) {
      select = some([d.properties], properties)
    }
    return select
  })
  return { data: filtered, geoIndex: new GeoLookups(filtered) }
}

// Temporal method until full transition to API-less implementation
export function getMapsRaw ({ fromYear, toYear, assetIds }) {
  return (dispatch, state) => {
    // Get data
    // const data = [];
    const filters = pickBy({
      ...state.filters,
      ...(fromYear && { fromYear }),
      ...(toYear && { toYear }),
      ...(assetIds && { assetIds })
    }, identity)

    dispatch({
      type: ActionTypes.MAPS_DATA_REQUEST
    })

    fetchData(filters)
      .then((data) => {
        dispatch({
          type: ActionTypes.MAPS_DATA_COMPLETE,
          data,
          filters
        })
      })
      .catch((error) => {
        dispatch({
          type: ActionTypes.MAPS_DATA_FAIL,
          error
        })
      })
  }
}
