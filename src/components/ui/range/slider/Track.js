import React from 'react'
import { PropTypes } from 'prop-types'
import styles from './Track.module.scss'

export const Track = ({ source, target, getTrackProps }) => {
  const orgProps = getTrackProps()
  const trackProps = {
    ...orgProps,
    onMouseDown: (event) => {
      event.isTrack = true
      orgProps.onMouseDown(event)
    },
    onTouchStart: event => {
      event.isTrack = true
      orgProps.onTouchStart(event)
    }

  }

  return (
    <>
      <div
        className={styles.track}
        style={{
          left: `${source.percent}%`,
          width: `${target.percent - source.percent}%`
        }}
        // {...getTrackProps() /* Setup events to make it clickable */}
        {...trackProps}
      />
    </>
  )
}

Track.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  target: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  getTrackProps: PropTypes.func.isRequired
}
