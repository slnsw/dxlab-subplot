import React from 'react'
import { PropTypes } from 'prop-types'
import styles from './Tick.module.scss'

export const Tick = ({ tick, count }) => (
  <>
    <div
      className={styles.tick}
      style={{
        left: `${tick.percent}%`
      }}
    />
    <div
      className={styles['tick-label']}
      style={{
        marginLeft: `${-(100 / count) / 2}%`,
        width: `${100 / count}%`,
        left: `${tick.percent}%`
      }}
    >
      {tick.value}
    </div>
  </>
)

Tick.propTypes = {
  tick: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  count: PropTypes.number.isRequired
}

Tick.defaultProps = {
  format: d => d
}
