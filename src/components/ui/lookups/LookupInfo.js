import React, { useContext } from 'react'
import { MapDataContext } from '../../../context/MapsContext'
import { get, isEmpty } from 'lodash'
import styles from './LookupInfo.module.scss'

export const LookupInfo = (props) => {
  const [mapState] = useContext(MapDataContext)

  const { near = {} } = mapState
  const show = !isEmpty(near)
  const { filtered = {}, all = {}, radius, placeName = '' } = near
  const placeNameShort = placeName.split(',').slice(0, 1).join(',')

  const getData = (source) => {
    const data = get(source, 'data', [])
    const maxYear = get(source, 'maxYear', 0)
    const minYear = get(source, 'minYear', 0)
    const count = data.length
    return {
      data, count, maxYear, minYear
    }
  }

  // Filtered data
  const filteredInfo = getData(filtered)
  const allInfo = getData(all)

  return (
    <>
      {show &&
        <div className={styles.container}>
          <div className={styles.info}>

            <p>Total <span>{allInfo.count}</span> maps from <span>{allInfo.minYear}</span> to <span>{allInfo.maxYear}</span>.</p>
            <p>Visible <span>{filteredInfo.count}</span> maps around <span>{radius}</span> km of <span>{placeNameShort}</span></p>
            <p>earliest <span>{filteredInfo.minYear}</span>, oldest <span>{filteredInfo.maxYear}</span></p>
          </div>
        </div>}
    </>
  )
}
