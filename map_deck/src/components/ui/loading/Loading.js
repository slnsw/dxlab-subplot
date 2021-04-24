import React from 'react'
import PropTypes from 'prop-types'

import { Backdrop, LinearProgress, Typography } from '@material-ui/core'
import styles from './Loading.module.scss'

export const Loading = ({ open, total, loaded }) => {
  const progress = (total !== 0) ? (loaded * 100) / total : 0
  const buffer = progress
  return (
    <>

      <Backdrop className={styles.loading} open={open}>

        <div className={styles.progressContainer}>
          <LinearProgress
            variant='buffer'
            value={progress}
            valueBuffer={buffer}
            color='secondary'
            classes={{
              colorSecondary: styles.progressColorBuffer,
              barColorSecondary: styles.progressBarColor,
              dashedColorSecondary: styles.progressDashedColor
            }}
          />
        </div>
        <div className={styles.message}>
          <Typography variant='caption'>Loading Maps</Typography>
        </div>
      </Backdrop>

    </>
  )
}

Loading.propTypes = {
  open: PropTypes.bool.isRequired,
  total: PropTypes.number.isRequired,
  loaded: PropTypes.number.isRequired
}
