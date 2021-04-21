import React, { useContext, useEffect } from 'react'
import PropTypes from 'prop-types'

import styles from './Opacity.module.scss'

import { UIContext } from '../../../context/UIContext'
import { Grid, Slider, Typography } from '@material-ui/core'
import { setSelectedMapOpacity } from '../../../context/UIActions'
import { debounce, get } from 'lodash'

export const OpacityControl = ({ style }) => {
  const [value, setValue] = React.useState(null)
  const [uiState, uiDispatch] = useContext(UIContext)
  const selectedOpacity = get(uiState, 'selectedOpacity', 1)
  const selected = get(uiState, 'selected', 1)

  const handleChange = debounce((_, newValue) => {
    setValue(newValue)
    uiDispatch(setSelectedMapOpacity(newValue))
  }, 10)

  // Set opacity with global UI state
  useEffect(() => {
    if (selected !== null) {
      setValue(selectedOpacity)
    }
  }, [selectedOpacity, selected])

  return (
    <>
      <Grid
        container
        // direction='column'
        // justify='center'
        // alignItems='stretch'
        className={styles.container}
        style={style}
      >
        {/* <Grid container> */}
        <Slider
          className={styles.slider}
          classes={{
            root: styles.root,
            track: styles.track,
            rail: styles.rail,
            thumb: styles.thumb,
            active: styles.active,
            focusVisible: styles.focusVisible,
            valueLabel: styles.valueLabel

          }}
          onChange={handleChange}
          valueLabelDisplay='auto'
          value={value}
          step={0.01}
          scale={(x) => parseInt(x * 100)}
          min={0}
          max={1}
        />
        {/* </Grid>
        <Grid container> */}
        <Typography className={styles.label}>Opacity</Typography>
        {/* </Grid> */}
      </Grid>
    </>
  )
}

OpacityControl.propTypes = {
  style: PropTypes.object
}
