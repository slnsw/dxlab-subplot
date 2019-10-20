export function fetchData(...params) {

  params = {
    years: {
      from: 1880,
      to: 1950
    },
    assetIds: null,
    around: null,
    aroundRadius: 4000,
    ...params['0']
  }

  // if (this.isLoading) {
  //     // console.log('Loading data.... wait...');
  //     return;
  //   }
  //   this.isLoading = true;

  const {
    years: {
      from,
      to
    },
    assetIds,
    around,
    aroundRadius
  } = params;

  const query = {
    'valid': true,
    // 'colored': true
  } // This flag should be apply in the server directly

  if (from && to) {
    query['year'] = {
      '$gte': from,
      '$lte': to
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
    //bbox
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
  // .then(data => {
  //   //this.isLoading = false;
  //   console.log(data);
  // })
  // Catch any errors we hit and update the app
  //.catch(error => this.setState({ error, isLoading: false }));
}

export const fetchData2 = async (...params) => {
  return await fetchData(...params); 
}