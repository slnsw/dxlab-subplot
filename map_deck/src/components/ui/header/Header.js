import React, { useContext } from 'react'
import { PropTypes } from 'prop-types'
import { MapDataContext } from '../../../context/MapsContext'
import { UIContext } from '../../../context/UIContext'
import styles from './Header.module.scss'

import { get } from 'lodash'

export const Header = ({ uiContext }) => {
  const [state] = useContext(MapDataContext)
  const [uiState] = useContext(UIContext)

  const fromYear = get(state, 'filters.fromYear', 0)
  const toYear = get(state, 'filters.toYear', 0)
  const data = get(state, 'data', [])

  let focus = get(uiState, 'focus')
  focus = (!focus) ? {} : focus

  const focusProperties = get(focus, 'properties', {})
  const { title, year } = focusProperties

  return (
    <div className={styles.root}>

      <div className={styles.logoHolder}>
        <a href='https://dxlab.sl.nsw.gov.au'>
          <img src='./images/logo-dxlab.png' alt='DX Lab website' className={styles.logoDxLab} />
        </a>
        <div className={styles.divider} />
        <a href='https://www.sl.nsw.gov.au/'>
          <img src='./images/logo-slnsw-white.png' alt='State Library New South Wales website' className={styles.logoSLNSW} />
        </a>
      </div>

      <div className={styles.containerInfo}>
        <h1 className={styles.range}> {fromYear} - {toYear} | {data.length}</h1>
        {title && <p className={styles.info}>[{year}] {title}</p>}
      </div>

    </div>
  )
}

Header.propTypes = {
  uiContext: PropTypes.array
}
