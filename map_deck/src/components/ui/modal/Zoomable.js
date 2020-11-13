import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import OSD from 'openseadragon'
import styles from './Zoomable.module.scss'

const Zoomable = ({ id, assetId, iiifIdentifier = '' }) => {
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
        tileSources: [
          `${process.env.REACT_APP_IIIF_BASE_URL}${iiifIdentifier}/info.json`
        ]
      })
    } catch (error) {
      console.warn(error)
    }
  }, [id, iiifIdentifier])

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
  assetId: PropTypes.string,
  iiifIdentifier: PropTypes.string
}
