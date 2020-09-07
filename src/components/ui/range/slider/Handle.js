import React from 'react'
import { PropTypes } from 'prop-types'
import styles from './Handle.module.scss'

export const Handle = ({
  handle: { id, value, percent },
  getHandleProps
}) => (
  <div
    className={`${styles.handle} vertical`}
    style={{
      left: `${percent}%`
    }}
    {...getHandleProps(id)}
  >
    <div className={styles['handle-label']}>
      {value}
    </div>
  </div>
)

Handle.propTypes = {
//   domain: PropTypes.array.isRequired,
  handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  getHandleProps: PropTypes.func.isRequired
}
