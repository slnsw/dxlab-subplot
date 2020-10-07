import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

import { UIContext } from '../../../context/UIContext'
import { MapDataContext } from '../../../context/MapsContext'
import { unSelectMap, selectMap } from '../../../context/UIActions'

import IdleTimer from 'react-idle-timer'
import ReactModal from 'react-modal'
import Zoomable from './Zoomable'
import { getImageUrl } from '../../../share/utils/helpers'

import { get, isEmpty, find } from 'lodash'

import styles from './ModalWindow.module.scss'

export const ModalWindow = ({ onRequestClose = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [{ title, year, width, height, location_name, asset_id, related = [] }, setSelected] = useState({})
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

      const { properties = {} } = selected
      const { similar = [], ...other } = properties

      const related = similar.filter((rel) => {
        let show = rel.asset_id !== asset_id
        if (rel.distance) {
          show = show && rel.distance <= 5
        }

        return show
      })

      setSelected({ related, ...other })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiState.selected])

  const handleCloseModal = () => {
    uiDispatch(unSelectMap())
    if (onRequestClose) {
      onRequestClose()
    }
  }

  const handleRelateClick = () => {
    const data = get(mapState, 'dataSet', [])
    const select = find(data, ['properties.asset_id', asset_id])
    if (select) {
      uiDispatch(selectMap(select))
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
          <h1 className={styles.modalTitle}> {title} </h1>

          <button className={styles.close} onClick={handleCloseModal}>X</button>

          <div className={styles.zoomable}>
            <Zoomable assetId={asset_id} id='mapZoom' />
          </div>

          <div className={styles.info}>

            <div className={styles.details}>
              <ul>
                <li><span>ID:</span> {asset_id}</li>
                <li><span>year: </span>{year}</li>
              </ul>

              <ul>
                <li><span>location:</span> {location_name}</li>
                <li><span>image:</span> ({width} x {height})</li>
              </ul>

            </div>

            <div className={styles.related}>

              {related.map((value, index) => {
                const image = getImageUrl(value.asset_id, 'uncrop', '256')
                return <img key={`rel${index}`} src={image} alt={value.distance} /> // onClick={() => handleRelateClick(value.asset_id)}
              })}

            </div>
          </div>
        </>
      </ReactModal>
    </>
  )
}

ModalWindow.propTypes = {
  onRequestClose: PropTypes.func
}
