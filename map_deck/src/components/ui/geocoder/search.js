// Base on https://github.com/wheredoesyourmindgo/react-mui-mapbox-geocoder/blob/83c31dde5d7e118b6862a6e350a2ff4df79a803c/src/MatGeocoder/search.ts#L4
import { omitBy, isNil } from 'lodash'

const ENDPOINT = 'https://api.mapbox.com'

export const search = async ({
  accessToken,
  query,
  country,
  types,
  endpoint = ENDPOINT,
  source = 'mapbox.places',
  onResult = () => {},
  proximity, // {longitude: number; latitude: number}
  bbox = [], // number[],
  limit = 5,
  autocomplete = true,
  language = 'EN'
}) => {
  const searchTime = new Date()
  try {
    const baseUrl = `${endpoint}/geocoding/v5/${source}/${query}.json`
    const searchParams = omitBy(
      {
        access_token: accessToken,
        proximity:
          proximity && Object.keys(proximity).length === 2
            ? `${proximity.longitude},${proximity.latitude}`
            : null,
        bbox: bbox && bbox.length > 0 ? bbox.join(',') : null,
        types,
        country,
        limit,
        autocomplete,
        language
      },
      isNil
    )
    const url = `${baseUrl}?${toUrlString(searchParams)}`
    const res = await fetch(url)
    const data = await res.json()
    onResult(data, null, searchTime)
    return { err: null, data, searchTime }
  } catch (err) {
    onResult(null, err, searchTime)
    return { err, data: null, searchTime }
  }
}

function toUrlString (params) {
  return Object.keys(params)
    .map(
      (key) => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    )
    .join('&')
}
