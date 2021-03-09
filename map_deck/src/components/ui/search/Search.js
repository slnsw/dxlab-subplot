import React, { useState, useCallback, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

import { Fab, Grid, Zoom } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import { get } from 'lodash'

import styles from './Search.module.scss'
import { Geocoder } from '../geocoder/geocoder'
import { ScreenKeyboard } from '../screenKeyboard/ScreenKeyboard'

// Geocoder, execute geo-search around sydney
const proximity = { longitude: 151.21065829636484, latitude: -33.86631790142455 }

export const Search = ({ onGeoLookupSearchResult, useVirtualKeyboard = false }) => {
  const [toggleSearch, setToggleSearch] = useState(true)
  const [toggleKeyboard, setToggleKeyboard] = useState(true)
  const [screenKeyboardValue, setScreenKeyboardValue] = useState(null)
  const keyboardRef = useRef()
  const keyboardWrapperRef = useRef()
  const geocoderRef = useRef()

  const handleToggle = useCallback(() => {
    setToggleSearch(!toggleSearch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOnResult = (event) => {
    const { result } = event
    if (onGeoLookupSearchResult) {
      onGeoLookupSearchResult(result)
    }
    updateKeyboard(get(result, 'place_name', ''))
  }

  const handleOnClear = useCallback(() => {
    setToggleSearch(true)
  }, [])

  const handleOnBlur = useCallback((value) => {
    if (value === null && !useVirtualKeyboard) {
      setToggleSearch(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOnClose = useCallback((e, reason) => {
    if (reason !== 'select-option' && !useVirtualKeyboard) {
      setToggleSearch(true)
    }
    if (reason === 'select-option' && useVirtualKeyboard) {
      setToggleKeyboard(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleOnChange = useCallback((value) => {
    updateKeyboard(value)
  }, [])

  // Virtual keyboard
  useOutsideAlerter(keyboardWrapperRef, (target) => {
    // console.log(target)
    // setToggleSearch(true)
    // setScreenKeyboardValue('')
    // updateKeyboard('')
  })

  useEffect(() => {
    if (useVirtualKeyboard) {
      setToggleKeyboard(toggleSearch)
    }
  }, [useVirtualKeyboard, toggleSearch])

  const handleKeyboardChange = useCallback(input => {
    // Update Geocoder input value manually
    setScreenKeyboardValue(input)
  }, [])

  const updateKeyboard = (value) => {
    if (keyboardRef.current) {
      keyboardRef.current.setInput(value)
    }
  }

  return (
    <>
      <Grid
        container
        direction='column'
        justify='flex-end'
        alignItems='center'
        className={styles.container}
      >
        <Zoom in={toggleSearch}>
          <Grid item>
            <Fab
              color='primary'
              aria-label='add'
              disableRipple
              onClick={handleToggle}
            //   style={{ width: '80px', height: '80px' }}
            >
              <SearchIcon />
            </Fab>
          </Grid>
        </Zoom>
        <Zoom
          in={!toggleSearch} onEntered={() => {
            // Set focus to Geocoder when transition finish
            if (!useVirtualKeyboard) geocoderRef.current.focus()
          }}
        >
          <Grid item id='geocoder' style={{ marginTop: '-40px' }}>
            <Geocoder
              ref={geocoderRef}
              accessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
              country='au'
              autoFocus
              proximity={proximity}
              manualInputValue={screenKeyboardValue}
              onResult={handleOnResult}
              onClear={handleOnClear}
              onClose={handleOnClose}
              onChange={handleOnChange}
              onBlur={handleOnBlur}
            />
          </Grid>
        </Zoom>
        <Zoom in={!toggleKeyboard}>
          <div
            ref={keyboardWrapperRef}
            className={styles.keyboardContainer}
          >
            <ScreenKeyboard
              ref={keyboardRef}
              onChange={handleKeyboardChange}
            />
          </div>
        </Zoom>
      </Grid>

    </>
  )
}

Search.propTypes = {
  useVirtualKeyboard: PropTypes.bool,
  onGeoLookupSearchResult: PropTypes.func
}

function useOutsideAlerter (ref, onOutside) {
  useEffect(() => {
    /**
         * Alert if clicked on outside of element
         */
    function handleClickOutside (event) {
      if (ref.current && !ref.current.contains(event.target)) {
        if (onOutside) {
          onOutside(event.target)
        }
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref])
}
