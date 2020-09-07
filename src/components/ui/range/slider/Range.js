import React from 'react'
import { PropTypes } from 'prop-types'
import { Handles, Tracks, Rail, Ticks } from 'react-compound-slider'
import styles from './Range.module.scss'

import { Handle } from './Handle'
import { Track } from './Track'
import { Tick } from './Tick'
import { RailSlide } from './RailSlide'

import { DraggableSlider } from './DraggableSlider'

export const Range = ({ domain = [], values = [], tickCount = 10, ...props }) => {
  return (
    <div className={`${styles.container}  ${styles.horizontal}`}>
      <DraggableSlider
        className={styles.slider}
        domain={domain}
        step={1}
        mode={3}
        values={values}
        {...props}
      >
        <Rail>
          {({ getRailProps }) => (
            <RailSlide getRailProps={getRailProps} />
          )}
        </Rail>

        <Handles>
          {({ handles, getHandleProps }) => (
            <div className={styles['slider-handles']}>
              {handles.map(handle => (
                <Handle
                  key={handle.id}
                  handle={handle}
                  getHandleProps={getHandleProps}
                />
              ))}
            </div>
          )}
        </Handles>

        <Tracks left={false} right={false}>
          {({ tracks, getTrackProps }) => (
            <div className={styles['slider-tracks']}>
              {tracks.map(({ id, source, target }) => (
                <Track
                  key={id}
                  source={source}
                  target={target}
                  getTrackProps={getTrackProps}
                />
              ))}
            </div>
          )}
        </Tracks>

        <Ticks count={tickCount}>
          {({ ticks }) => (
            <div className={styles['slider-ticks']}>
              {ticks.map(tick => (
                <Tick key={tick.id} tick={tick} count={ticks.length} />
              ))}
            </div>
          )}
        </Ticks>

      </DraggableSlider>
    </div>
  )
}

Range.propTypes = {
  domain: PropTypes.array.isRequired,
  values: PropTypes.array.isRequired,
  tickCount: PropTypes.number
}
