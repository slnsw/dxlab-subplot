import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

import { UIContext } from '../../../context/UIContext'
import { MapDataContext } from '../../../context/MapsContext'
import { unSelectMap, selectMap } from '../../../context/UIActions'

import IdleTimer from 'react-idle-timer'
import ReactModal from 'react-modal'
import Zoomable from './Zoomable'
import Slider from 'react-slick'

import { getImageUrl } from '../../../share/utils/helpers'

import { get, isEmpty, find } from 'lodash'

import styles from './ModalWindow.module.scss'

const slideRef = React.createRef()

export const ModalWindow = ({ onRequestClose = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [{ title, year, width, height, location_name, asset_id, iiif_identifier, url, collection_id, related = [] }, setSelected] = useState({})
  const [uiState, uiDispatch] = useContext(UIContext)
  const [mapState] = useContext(MapDataContext)
  // eslint-disable-next-line no-unused-vars
  let idleTimer = null

  useEffect(() => {
    // Update search lookup info if near data are in the store
    const { selected = {} } = uiState
    const open = !isEmpty(selected)
    setIsOpen(open)
    if (open) {
      // const { center, radius, placeName } = near
      // mapDispatch(getMapsWithin({ center, radius, placeName }))

      if (slideRef.current) {
        slideRef.current.slickGoTo(0)
      }

      const { properties = {} } = selected
      const { similar = [], ...other } = properties

      const related = similar.filter((rel) => {
        let show = rel.asset_id !== asset_id
        if (rel.distance) {
          show = show && rel.distance <= 5
        }

        return show
      })

      const url = `${process.env.REACT_APP_SLNSW_COLLECTION_BASE_URL}${collection_id}`

      setSelected({ related, url, ...other })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState.selected])

  const handleCloseModal = () => {
    uiDispatch(unSelectMap())
    if (onRequestClose) {
      onRequestClose()
    }
  }

  const handleRelateClick = (asset_id) => {
    const data = get(mapState, 'dataSet', [])
    const select = find(data, ['properties.asset_id', asset_id])

    if (select) {
      uiDispatch(selectMap({ ...select }))
    }
  }

  return (
    <>
      <IdleTimer
        ref={ref => { idleTimer = ref }}
        element={document}
        onIdle={handleCloseModal}
        debounce={250}
        timeout={1000 * 60 * 0.5}
      />

      <ReactModal
        isOpen={isOpen}
        onRequestClose={handleCloseModal}
        ariaHideApp={false}
        className={{ base: styles.modalWindow, afterOpen: styles.afterOpen, beforeClose: styles.beforeClose }}
        overlayClassName={styles.modalOverlay}
        closeTimeoutMS={600}
      >
        <>

          <button className={styles.close} onClick={handleCloseModal}>X</button>

          <div className={styles.header}>
            <h1 className={styles.title}>
              <a href={url} target='_blank' rel='noreferrer'>
                {title}
              </a>
            </h1>

            <h3 className={styles.info}>{year} - {location_name}</h3>
          </div>

          <div className={styles.zoomable}>
            <Zoomable assetId={asset_id} iiifIdentifier={iiif_identifier} id='mapZoom' />
            <div className={styles.imageInfo}>
              <span> {asset_id} | ({width} x {height})</span>
            </div>
          </div>

          <div className={styles.related}>
            <Slider
              dots={false}
              infinite={false}
              slidesToShow={5}
              ref={slider => (slideRef.current = slider)}
            >

              {related.map((value, index) => {
                const image = getImageUrl(value.asset_id, 'uncrop', '256')
                return (
                  <div key={`rel${index}`}>
                    <div className={styles.container}>
                      <div
                        className={styles.thumb}
                        style={{ backgroundImage: `url(${image})` }}
                        onClick={() => handleRelateClick(value.asset_id)}
                      />
                      {/* <img src={image} alt={value.distance} onClick={() => handleRelateClick(value.asset_id)} /> */}
                      {/* <img src={image} alt={value.distance} /> */}
                    </div>
                  </div>
                )
              })}
            </Slider>

          </div>

        </>
      </ReactModal>
    </>
  )
}

ModalWindow.propTypes = {
  onRequestClose: PropTypes.func
}
