import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import OSD from 'openseadragon'
import { getImageUrl } from '../../../share/utils/helpers'
import styles from './Zoomable.module.scss'

const Zoomable = ({ id, assetId }) => {
  // eslint-disable-next-line no-unused-vars
  let el = null
  // eslint-disable-next-line no-unused-vars
  const viewer = useRef()

  useEffect(() => {
    // Create an instance of OSD
    console.log(id)
    try {
      if (viewer.current) {
        viewer.current.destroy()
      }

      viewer.current = OSD({
        id: id,
        visibilityRatio: 1.0,
        constrainDuringPan: false,
        defaultZoomLevel: 1,
        minZoomLevel: 1,
        maxZoomLevel: 10,
        showNavigator: false,
        tileSources: {
          type: 'image',
          url: getImageUrl(assetId, 'uncrop', '1024')
        }
      })
    } catch (error) {
      console.warn(error)
    }
  }, [id, assetId])

  return (
    <>
      <div className={styles.openseadragon} ref={node => { el = node }}>
        <div className='navigator-wrapper c-shadow'>
          <div id='navigator' />
        </div>
        <div className={styles.container} id={id} />
      </div>
    </>
  )
}

export default Zoomable

Zoomable.propTypes = {
  id: PropTypes.string,
  assetId: PropTypes.string
}
