import React, { useContext } from 'react'
import { PropTypes } from 'prop-types'
import { MapDataContext } from '../../../context/MapsContext'
import { UIContext } from '../../../context/UIContext'
import { getImageUrl } from '../../../share/utils/helpers'
import styles from './Header.module.scss'

import { get } from 'lodash'

export const Header = ({ uiContext }) => {
  const [state] = useContext(MapDataContext)
  const [uiState] = useContext(UIContext)

  const fromYear = get(state, 'filters.fromYear', 0)
  const toYear = get(state, 'filters.toYear', 0)
  const data = get(state, 'data', [])

  let focus = get(uiState, 'focus')
  const isIdle = get(uiState, 'isIdle', false)
  focus = (!focus) ? {} : focus

  const focusProperties = get(focus, 'properties', {})
  const { title, year, asset_id, height, width } = focusProperties
  const { mouseX = 0, mouseY = 0 } = focus

  const vw = window.innerWidth
  const vh = window.innerHeight
  const imgH = 512 * (height / width)

  const showPreview = asset_id && mouseX !== null && mouseY !== null

  const vPosition = (mouseY <= (vh * 0.5)) ? { bottom: 20 } : { top: 90 }
  const hPosition = (mouseX <= (vw * 0.5)) ? { right: '10%' } : { left: 0 }
  const imgStyle = {
    ...vPosition,
    ...hPosition,
    height: imgH
  }

  const url = getImageUrl(asset_id, 'uncrop', 512)
  return (
    <div className={styles.rootStyle}>
      <h1 className={styles.rangeHeaderStyle}> {fromYear} - {toYear} | {data.length}</h1>
      {title && <p className={styles.infoStyle}>[{year}] {title}</p>}
      {/*
      {(showPreview && !isIdle) &&
        <img
          className={styles.imgRootStyle}
          src={url}
          alt={asset_id}
          style={imgStyle}
        />} */}

    </div>
  )
}

Header.propTypes = {
  uiContext: PropTypes.array
}
