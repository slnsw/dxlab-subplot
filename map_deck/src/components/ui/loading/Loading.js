import React from 'react'
import { Grid, LinearProgress, Typography } from '@material-ui/core'
import styles from './Loading.module.scss'

export const Loading = () => (
  <>
    <div className={styles.loading}>

      <LinearProgress />
      <Typography>Loading maps</Typography>

    </div>
  </>
)
