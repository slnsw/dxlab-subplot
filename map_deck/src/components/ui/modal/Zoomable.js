import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import OSD from 'openseadragon'
import styles from './Zoomable.module.scss'

import HomeIcon from '@material-ui/icons/Home'
import ZoomIn from '@material-ui/icons/ZoomIn'
import ZoomOut from '@material-ui/icons/ZoomOut'

const Zoomable = ({ id, assetId, showNavigator = true, iiifIdentifier = '' }) => {
  // eslint-disable-next-line no-unused-vars
  let el = null
  // eslint-disable-next-line no-unused-vars
  const viewer = useRef()

  useEffect(() => {
    // Create an instance of OSD
    try {
      if (viewer.current) {
        viewer.current.destroy()
      }

      viewer.current = OSD({
        id: id,
        tileSources: [
          `${process.env.REACT_APP_IIIF_BASE_URL}${iiifIdentifier}/info.json`
        ],
        // toolbar: 'navigator',
        zoomInButton: 'zoom-in',
        zoomOutButton: 'zoom-out',
        homeButton: 'home'
        // fullPageButton: 'full-page'
      })
    } catch (error) {
      console.warn(error)
    }
  }, [id, iiifIdentifier])

  return (
    <>
      <div className={styles.openseadragon} ref={node => { el = node }}>
        <div id='navigator' className={styles.navigator}>
          {showNavigator &&
          (
            <>
              <div className={styles.navigationButton}><ZoomIn id='zoom-in' /></div>
              <div className={styles.navigationButton}><ZoomOut id='zoom-out' /></div>
              <div className={styles.navigationButton}><HomeIcon id='home' /></div>
            </>
          )}
        </div>
        <div className={styles.container} id={id} />
      </div>
    </>
  )
}

export default Zoomable

Zoomable.propTypes = {
  id: PropTypes.string,
  assetId: PropTypes.string,
  iiifIdentifier: PropTypes.string,
  showNavigator: PropTypes.bool
}
