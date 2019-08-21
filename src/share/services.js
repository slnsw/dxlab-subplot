import { MergeGeoJsonPolygon } from './utils';
import { pick, cloneDeep } from 'lodash';


export class MapDataService {

  queryParameters = {
    years: {
      from: 1884,
      to: 1885
    },
    assetIds: null,
    around: null,
    aroundRadius: 4000,
  }

  constructor(...initial) {
    this.queryParameters = {
      ...this.queryParameters,
      ...initial['0']
    }

    this.data = null;
  }

  getFootprint(data) {
    data = data.map((m) => {
      // Change eleveation base on year
      // m.cutline.coordinates[0] = m.cutline.coordinates[0].map((c: any) => {
      //   //const elv = 20 *  mapValue(m.year, this.state.year_from, this.state.year_to, 0, this.state.year_to - this.state.year_from);
      //   c.push(0);
      //   return c;

      // });

      const polygon = cloneDeep(m.cutline);
      polygon['properties'] = pick(m, ['year', 'title', 'asset_id']);

      return m.cutline;
    });

    const merge = new MergeGeoJsonPolygon();
    merge.setData(data);
    return merge.getCoordinates();

  }



  fetch(...params) {

    params = {
      ...this.queryParameters,
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
      'valid': true
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
      query['cutline'] = {
        '$near': {
          '$geometry': around,
          '$maxDistance': aroundRadius
        }
      };
    }

    // Where we're fetching data from
    return fetch(`http://localhost:5000/api/v1/DXmap?query=` + JSON.stringify(query))
      // We get the API response and receive data in JSON format...
      .then(response => response.json())
      // .then(data => {
      //   //this.isLoading = false;
      //   this.data = data;
      // });
    // Catch any errors we hit and update the app
    //.catch(error => this.setState({ error, isLoading: false }));
  }

}

export function fetchData(...params) {

  params = {
    years: {
      from: 1884,
      t: 1886
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
    'valid': true
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

  // Where we're fetching data from
  return fetch(`http://localhost:5000/api/v1/DXmap?query=` + JSON.stringify(query))
    // We get the API response and receive data in JSON format...
    .then(response => response.json())
  // .then(data => {
  //   //this.isLoading = false;
  //   console.log(data);
  // })
  // Catch any errors we hit and update the app
  //.catch(error => this.setState({ error, isLoading: false }));
}