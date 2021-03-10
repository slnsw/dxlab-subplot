import React, { useContext, useEffect, useState } from 'react'
import { MapDataContext } from '../../../context/MapsContext'
import { get, isEmpty, map } from 'lodash'
import styles from './LookupInfo.module.scss'

export const LookupInfo = (props) => {
  const [state, setState] = useState({
    filteredInfo: {},
    allInfo: {},
    placeNameShort: '',
    radius: ''
  })
  const [show, setShow] = useState(false)
  const [mapState] = useContext(MapDataContext)

  const getData = (source) => {
    const data = get(source, 'data', [])
    const maxYear = get(source, 'maxYear', 0)
    const minYear = get(source, 'minYear', 0)
    const count = data.length
    return {
      data, count, maxYear, minYear
    }
  }

  useEffect(() => {
    const { near = {} } = mapState
    const { filtered = {}, all = {}, radius, placeName = '' } = near
    const placeNameShort = placeName.split(',').slice(0, 1).join(',')

    // Filtered data
    const filteredInfo = getData(filtered)
    const allInfo = getData(all)

    setShow(!isEmpty(near))
    setState({ filteredInfo, allInfo, placeNameShort, radius })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapState.near])

  const { filteredInfo, allInfo, placeNameShort, radius } = state

  return (
    <>
      {show &&
        <div className={styles.container}>
          <div className={styles.info}>

            <p>Total <span>{allInfo.count}</span> maps from <span>{allInfo.minYear}</span> to <span>{allInfo.maxYear}</span>.</p>
            <p>Visible <span>{filteredInfo.count}</span> maps around <span>{radius}</span> km of search. {/* of <span>{placeNameShort}</span> */}</p>
            <p>earliest <span>{filteredInfo.minYear}</span>, oldest <span>{filteredInfo.maxYear}</span></p>
          </div>
        </div>}
    </>
  )
}
