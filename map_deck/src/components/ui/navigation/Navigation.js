import React, { useContext, useRef, useEffect, useState } from 'react'
import styles from './Navigation.module.scss'

import { UIContext } from '../../../context/UIContext'
import { goToViewState } from '../../../context/UIActions'

import { EventManager } from 'mjolnir.js'
const eventManager = new EventManager()

export const NavigationControl = () => {
  const ref = useRef(null)
  const [bearing, setBearing] = useState(0)
  const [pitch, setPitch] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [uiState, uiDispatch] = useContext(UIContext)

  const { viewState = {} } = uiState
  const { bearing: mapBearing, pitch: mapPitch } = viewState

  useEffect(() => {
    if (!dragging) {
      setBearing(mapBearing)
      setPitch(mapPitch)
    }
  }, [mapBearing, mapPitch, dragging])

  useEffect(() => {
    if (dragging) {
      uiDispatch(goToViewState({
        ...viewState,
        bearing,
        pitch
      }))
    }
  }, [bearing, pitch, dragging])

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

  return (
    <>
      <div className={styles.root} ref={ref}>
        <div
          className={styles.container}
          style={{ transform: `rotateX(${pitch}deg) rotateY(0deg)  rotateZ(${-1 * bearing}deg)` }}
        >
          <div className={styles.arrow} />
        </div>
      </div>
    </>
  )
}
