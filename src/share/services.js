export function fetchData( {around, aroundRadius, fromYear, toYear, assetIds}) {

  const query = {
    'valid': true,
    // 'has_similar': true
    // 'colored': true
  } // This flag should be apply in the server directly

  if (fromYear && toYear) {
    query['year'] = {
      '$gte': fromYear,
      '$lte': toYear
    };

  }

  // assetIds = 'a1367540'; 
  if (assetIds) {
    let ids = assetIds.split(',').map((e) => {
      return e.trim();
    });
    query['asset_id'] = {
      '$in': ids
    }
  }

  if (around) {
    const {geometry} = around;
    query['center'] = {
      '$near': {
        '$geometry': geometry,
        '$maxDistance': (aroundRadius && 800)
      }
    };
  }

  // Call REST API
  return fetch(`${process.env.REACT_APP_API_BASE_URL}?query=${JSON.stringify(query)}`)
    // We get the API response and receive data in JSON format...
    .then(response => response.json())
}

export function loadData() {
  const query = {
    'properties.year': {'$lt': 1890, '$ne': null},
  }
  return fetch(`${process.env.REACT_APP_DATA_URL}?query=${JSON.stringify(query)}`)
  // We get the API response and receive data in JSON format...
  .then(response => response.json())
  // TODO: Wrap response around FeatureCollection extructure
  // .then(data => { 
  //   return {
  //       'type': 'FeatureCollection',
  //       'features': data
  //   }
  // }) 
}