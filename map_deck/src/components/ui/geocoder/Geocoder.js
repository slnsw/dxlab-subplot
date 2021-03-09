import React, { useEffect, useImperativeHandle, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { get, isEmpty, throttle } from 'lodash'
import { search } from './search'

import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

import { Grid, Paper, Popper, Typography } from '@material-ui/core'
import LocationOnIcon from '@material-ui/icons/LocationOn'

import styles from './Geocoder.module.scss'

export const Geocoder = React.forwardRef(({
  accessToken,
  proximity,
  country,
  manualInputValue,
  onResult,
  onClear,
  onClose,
  onChange,
  onBlur,
  autoFocus = false
}, ref) => {
  const [value, setValue] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [options, setOptions] = useState([])
  const [showOptions, setShowOptions] = useState(false)

  const inputRef = useRef()

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus()
    }
  }))

  const lookup = React.useMemo(
    () =>
      throttle((query, onResult) => {
        search({
          accessToken,
          query,
          onResult,
          proximity,
          country,
          autocomplete: true
        })
      }, 200),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  useEffect(() => {
    let active = true

    if (inputValue === '') {
      setOptions(value ? [value] : [])
      return undefined
    }

    lookup(inputValue, (results) => {
      if (active) {
        let newOptions = []

        if (value) {
          newOptions = [value]
        }

        if (results) {
          results = get(results, 'features', [])
          newOptions = [...newOptions, ...results]
        }
        setOptions(newOptions)
      }
    })

    return () => {
      active = false
    }
  }, [value, inputValue, lookup])

  useEffect(() => {
    setInputValue(manualInputValue || '')
    setShowOptions(!isEmpty(manualInputValue))
  }, [manualInputValue])

  return (
    <>

      <Paper
        elevation={0}
        className={styles.paper}
      >
        <Autocomplete
          id='address-lookup'
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.place_name)}
          style={{ width: 400 }}
          filterOptions={(x) => x}
          options={options}
          autoComplete
          includeInputInList
          filterSelectedOptions
          //   disableClearable
          value={value}
          inputValue={inputValue}
          popupIcon={null}
          open={showOptions}
          PopperComponent={
            (props) =>
              <Popper
                {...props}
                className={styles.popper}
                placement='top'
                modifiers={{
                  offset: {
                    enabled: true,
                    offset: '0, 30'
                  }
                }}
              />
          }
          onChange={(event, newValue, reason) => {
            setOptions(newValue ? [newValue, ...options] : options)
            setValue(newValue)
            setShowOptions(false)

            if (onResult && newValue) {
              onResult({ result: newValue })
            }
            if (onClear && newValue === null) {
              onClear()
            }
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue)
            setShowOptions(true)
            if (onChange) {
              onChange(newInputValue)
            }
          }}
          onBlur={() => {
            if (onBlur) {
              onBlur(value)
            }
          }}
          onClose={(e, reason) => {
            setShowOptions(false)
            if (onClose) {
              onClose(e, reason)
            }
          }}
          renderInput={(params) => {
            params = {
              ...params,
              InputProps: {
                ...params.InputProps,
                className: `${params.InputProps.className} ${styles.root}`
              }
            }
            return (
              <TextField
                {...params}
                placeholder='Search a location'
                fullWidth
                autoFocus={autoFocus}
                inputRef={inputRef}
              />
            )
          }}
          renderOption={(option) => {
            return (
              <Grid container alignItems='center'>
                <Grid item style={{ margin: '0 10px 0 0' }}>
                  <LocationOnIcon />
                </Grid>
                <Grid item xs>
                  {option.text}
                  <Typography variant='body2' color='textSecondary'>
                    {option.place_name}
                  </Typography>
                </Grid>
              </Grid>
            )
          }}
        />
      </Paper>

    </>

  )
})

Geocoder.displayName = 'Geocoder'

Geocoder.propTypes = {
  accessToken: PropTypes.string.isRequired,
  proximity: PropTypes.any,
  country: PropTypes.string,
  manualInputValue: PropTypes.string,
  onResult: PropTypes.func,
  onClear: PropTypes.func,
  onClose: PropTypes.func,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  autoFocus: PropTypes.bool

}
