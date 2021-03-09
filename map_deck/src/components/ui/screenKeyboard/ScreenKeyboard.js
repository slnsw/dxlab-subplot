import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Keyboard from 'react-simple-keyboard'
import 'react-simple-keyboard/build/css/index.css'

export const ScreenKeyboard = React.forwardRef(({ onChange, visible = true }, ref) => {
  const [layout, setLayout] = useState('default')

  const handleShift = () => {
    const newLayoutName = layout === 'default' ? 'shift' : 'default'
    setLayout(newLayoutName)
  }

  const handleKeyPress = button => {
    if (button === '{shift}' || button === '{lock}') handleShift()
  }

  if (visible) {
    return (
      <Keyboard
        keyboardRef={r => (ref.current = r)}
        layoutName={layout}
        onChange={onChange}
        onKeyPress={handleKeyPress}
      />
    )
  } else {
    return null
  }
})

ScreenKeyboard.displayName = 'ScreenKeyboard'

ScreenKeyboard.propTypes = {
  onChange: PropTypes.func.isRequired,
  visible: PropTypes.bool
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
