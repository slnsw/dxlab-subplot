import React, { useContext, useRef, useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import styles from './Navigation.module.scss'

import { UIContext } from '../../../context/UIContext'
import { goToViewState } from '../../../context/UIActions'

import { EventManager } from 'mjolnir.js'
import { isNumber, debounce } from 'lodash'
const eventManager = new EventManager()

export const NavigationControl = ({ style }) => {
  const ref = useRef(null)
  const [bearing, setBearing] = useState(0)
  const [rotateX, setRotateX] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [uiState, uiDispatch] = useContext(UIContext)

  const { viewState = {} } = uiState

  const _uiDispatch = useCallback((...args) => uiDispatch(...args), [uiDispatch])

  const updateMapViewState = useCallback(debounce(
    () => {
      if (isNumber(bearing) && !isNaN(bearing) && isNumber(pitch) && !isNaN(pitch)) {
        _uiDispatch(goToViewState({
          ...viewState,
          bearing,
          pitch
        }))
      }
    }, 50)
  , [bearing, pitch, _uiDispatch, viewState])

  useEffect(() => {
    if (!dragging) {
      setBearing(viewState.bearing)
      setPitch(viewState.pitch)
    }
  }, [viewState, dragging])

  useEffect(() => {
    if (dragging) {
      updateMapViewState()
    }
  }, [dragging, updateMapViewState])

  useEffect(() => {
    // did mount
    eventManager.on('panstart', () => {
      setDragging(true)
    })
    eventManager.on('panend', () => {
      setDragging(false)
    })

    eventManager.on('panleft', () => setBearing(prev => prev - 10))
    eventManager.on('panright', () => setBearing(prev => prev + 10))

    eventManager.on('panup', () => {
      setPitch(prev => {
        prev = prev + 3
        return prev >= 60 ? 60 : prev
      })
    })

    eventManager.on('pandown', () => {
      setPitch(prev => {
        prev = prev - 3
        return prev <= 0 ? 0 : prev
      })
    })

    eventManager.setElement(ref.current)
    // unmount
    return () => eventManager.setElement(null)
  }, [])

  useEffect(
    () => {
      // Convert bearing to angle
      const angle = (bearing < 0) ? bearing * -1 : 360 - bearing
      setRotateX(angle || 0)
    },
    [bearing])

  return (
    <>
      <div className={styles.root} ref={ref} style={style}>
        <div
          className={styles.container}
          style={{
            transform: `rotateX(${pitch}deg) rotateY(0deg)  rotateZ(${rotateX}deg)`,
            transition: `${!dragging ? 'transform 100ms linear' : ''}`
          }}
        >
          <div className={styles.arrow} />
        </div>
      </div>
    </>
  )
}

NavigationControl.propTypes = {
  style: PropTypes.object
}
