import React, { useEffect, useContext, useState } from 'react'
import { Range as Slider } from './slider/Range'
import { BarChart } from './BarChart'

import { MapDataContext } from '../../../context/MapsContext'
import { applyFilters, getMapsWithin } from '../../../context/MapsActions'

// import { UIContext } from '../../context/UIContext'
import { get, debounce, isEmpty } from 'lodash'
import styles from './Range.module.scss'

export const Range = () => {
  const [state, setState] = useState({ from: 0, to: 1, maxYear: 1, minYear: 0, histYears: [] })
  const [histState, setHistState] = useState([])
  const [mapState, mapDispatch] = useContext(MapDataContext)
  // const [uiState, UIDispatch] = useContext(UIContext)
  const dataSet = get(mapState, 'dataSet', [])
  const filters = get(mapState, 'filters', {})
  const meta = get(mapState, 'meta', {})

  useEffect(() => {
    setState({
      fromYear: get(filters, 'fromYear', 0),
      toYear: get(filters, 'toYear', 0),
      maxYear: get(meta, 'maxYear', 0),
      minYear: get(meta, 'minYear', 0)
    })
  }, [filters, meta])

  useEffect(() => {
    setHistState(
      dataSet.map((it) => (get(it, 'properties.year')))
    )
  }, [dataSet])

  const { fromYear, toYear, maxYear, minYear } = state
  const domain = [minYear, maxYear]
  const defaultValues = [fromYear, toYear]

  // Update filter
  const handleChange = debounce((values) => {
    const [fromYear, toYear] = values
    if (fromYear > 0 && toYear > 0) {
      mapDispatch(applyFilters({ fromYear, toYear }))
    }
  }, 40)

  return (
    <>
      {maxYear > 1 &&
        <div className={styles.container}>
          <div className={styles.panel}>
            <div className={styles.chart}>
              <BarChart
                className={styles.chart}
                data={histState}
                highlight={defaultValues}
                domain={domain}
              />
            </div>
            <Slider
              domain={domain}
              values={defaultValues}
              onChange={handleChange}
              tickCount={20}
            />
          </div>
        </div>}
    </>
  )
}
