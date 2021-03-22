import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Keyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'
import styles from './ScreenKeyboard.module.scss'

export const ScreenKeyboard = React.forwardRef(({ onChange, onClose }, ref) => {
  const [layout, setLayout] = useState('default')

  const handleShift = () => {
    const newLayoutName = layout === 'default' ? 'shift' : 'default'
    setLayout(newLayoutName)
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  const handleKeyPress = button => {
    if (button === '{shift}' || button === '{lock}') handleShift()
    if (button === '{close}') handleClose()
  }

  return (
    <Keyboard
      keyboardRef={r => (ref.current = r)}
      layoutName={layout}
      onChange={onChange}
      onKeyPress={handleKeyPress}
      theme={styles.myTheme}
      buttonTheme={[
        {
          class: styles.hgAccentKey,
          buttons: '{close}'
        }
      ]}
      layout={{
        default: [
          '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
          '{tab} q w e r t y u i o p [ ] \\',
          "{lock} a s d f g h j k l ; ' {close}",
          '{shift} z x c v b n m , . / {shift}',
          '.com @ {space}'
        ],
        shift: [
          '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
          '{tab} Q W E R T Y U I O P { } |',
          '{lock} A S D F G H J K L : " {close}',
          '{shift} Z X C V B N M < > ? {shift}',
          '.com @ {space}'
        ]
      }}
      display={{
        '{close}': 'close'
      }}
      mergeDisplay
    />
  )
})

ScreenKeyboard.displayName = 'ScreenKeyboard'

ScreenKeyboard.propTypes = {
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

// KEYBOARD
/*

  const keyboardRef = useRef()

    const handleKeyboardChange = useCallback(input => {
      setInput(input)
    }, [])

    const handleChangeInput = useCallback(event => {
      const input = event.target.value
      setInput(input)
      if (keyboardRef.current) {
        keyboardRef.current.setInput(input)
      }
    }, [])

    */
