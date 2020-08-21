import React, { Component } from 'react'
import { PropTypes } from 'prop-types'

import { get } from 'lodash'
import { MapDataContext } from '../../../context/MapsContext'
import { getImageUrl } from '../../../share/utils'

const rootStyle = {
  position: 'absolute',
  color: 'white',
  top: 20,
  right: '7%',
  zIndex: 3010
}

const rangeHeaderStyle = {
  textAlign: 'right',
  marginBottom: 0
}

const infoStyle = {
  textAlign: 'right',
  marginTop: 0
}

const imgRootStyle = {
  position: 'fixed',
  border: '2px solid rgba(255, 255, 255, .5)',
  backgroundColor: 'rgba(255, 255, 255, .2)',
  margin: 20,
  width: 512
}

export class Header extends Component {
  render () {
    const [state] = this.context
    const fromYear = get(state, 'maps.filters.fromYear', 0)
    const toYear = get(state, 'maps.filters.toYear', 0)
    const data = get(state, 'maps.data', [])

    const [uiState] = this.props.uiContext
    let focus = get(uiState, 'focus')
    focus = (!focus) ? {} : focus

    const focusProperties = get(focus, 'properties', {})
    const { title, year, asset_id, height, width } = focusProperties
    const { mouseX = 0, mouseY = 0 } = focus

    const vw = window.innerWidth
    const vh = window.innerHeight
    const imgH = 512 * (height / width)

    const showPreview = asset_id && mouseX && mouseY

    const vPosition = (mouseY <= (vh * 0.5)) ? { bottom: 20 } : { top: 90 }
    const hPosition = (mouseX <= (vw * 0.5)) ? { right: '10%' } : { left: 0 }
    const imgStyle = {
      ...imgRootStyle,
      ...vPosition,
      ...hPosition,
      height: imgH
    }

    const url = getImageUrl(asset_id, 'uncrop', 512)

    return (
      <div style={rootStyle}>
        <h1 style={rangeHeaderStyle}> {fromYear} - {toYear} | {data.length}</h1>
        {title && <p style={infoStyle}>[{year}] {title}</p>}

        {showPreview &&
          <img
            src={url}
            alt={asset_id}
            style={imgStyle}
          />}

      </div>
    )
  }
}

Header.contextType = MapDataContext

Header.propTypes = {
  uiContext: PropTypes.array
}
