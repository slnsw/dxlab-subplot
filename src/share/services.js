export function fetchData({around, aroundRadius, fromYear, toYear, assetIds}) {

  const query = {
    'valid': true,
    // 'colored': true
  } // This flag should be apply in the server directly

  if (fromYear && toYear) {
    query['year'] = {
      '$gte': fromYear,
      '$lte': toYear
    };

  }

  if (assetIds) {
    let ids = assetIds.split(',').map((e) => {
      return e.trim();
    });
    query['asset_id'] = {
      '$in': ids
    }
  }

  if (around) {
    query['center'] = {
      '$near': {
        '$geometry': around,
        '$maxDistance': aroundRadius
      }
    };
  }

  // Call REST API
  return fetch(`${process.env.REACT_APP_API_BASE_URL}?query=${JSON.stringify(query)}`)
    // We get the API response and receive data in JSON format...
    .then(response => response.json())
}
