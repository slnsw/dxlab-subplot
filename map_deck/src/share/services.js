export function fetchData ({ around, aroundRadius, fromYear, toYear, assetIds }) {
  const query = {
    valid: true
    // 'has_similar': true
    // 'colored': true
  } // This flag should be apply in the server directly

  if (fromYear && toYear) {
    query.year = {
      $gte: fromYear,
      $lte: toYear
    }
  }

  if (assetIds) {
    const ids = assetIds.split(',').map((e) => {
      return e.trim()
    })
    query.asset_id = {
      $in: ids
    }
  }

  if (around) {
    const { geometry } = around
    query.center = {
      $near: {
        $geometry: geometry,
        $maxDistance: (aroundRadius && 800)
      }
    }
  }

  // Call REST API
  return fetch(`${process.env.REACT_APP_API_RAW_URL}?query=${JSON.stringify(query)}`)
    // We get the API response and receive data in JSON format...
    .then(response => response.json())
}

export function loadAPIData () {
  // base query
  const query = {
    'properties.year': { $ne: null }
  }
  return fetch(`${process.env.REACT_APP_API_DATA_URL}?query=${JSON.stringify(query)}`)
  // We get the API response and receive data in JSON format...
    .then(response => response.json())
}

export function loadData () {
  return fetch(`${process.env.REACT_APP_DATA_URL}`)
  // We get the API response and receive data in JSON format...
    .then(response => response.json())
}
