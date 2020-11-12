import React from 'react'
import { PropTypes } from 'prop-types'
import styles from './RailSlide.module.scss'

export const RailSlide = ({ getRailProps }) => (
  <div className={styles.rail} {...getRailProps()} />
)

RailSlide.propTypes = {
  getRailProps: PropTypes.func.isRequired
}
