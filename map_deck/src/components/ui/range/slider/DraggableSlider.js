// import React from 'react'
import { Slider } from 'react-compound-slider'
import { isNotValidTouch, getTouchPosition, getSliderDomain } from 'react-compound-slider/Slider/utils'

import { min, max } from 'lodash'

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined'

export class DraggableSlider extends Slider {
  constructor (props) {
    super(props)
    this.onTrackEventMove = this.onTrackEventMove.bind(this)
    this.onTrackMouseUp = this.onTrackMouseUp.bind(this)
    this.onTrackTouchEnd = this.onTrackTouchEnd.bind(this)
  }

  onStart (e, handleId, isTouch) {
    if (e.isTrack === true) {
      // Clean custom variable to determinate if the event source was the
      // Track component
      e.isTrack = undefined

      if (isTouch) {
        this.addTrackTouchEvents()
      } else {
        this.addTrackMouseEvents()
      }
    } else {
      super.onStart(e, handleId, isTouch)
    }
  }

  onTrackEventMove (e) {
    const isTouch = window.TouchEvent && e instanceof TouchEvent
    const {
      state: { handles: curr, pixelToStep, prevDragValue = 0, step, domain, offsetValues },
      props: { vertical }
    } = this

    if (isTouch) {
      if (pixelToStep === null || isNotValidTouch(e)) {
        return
      }
    }

    // double check the dimensions of the slider
    pixelToStep.setDomain(getSliderDomain(this.slider.current, vertical))

    // find the closest value (aka step) to the event location
    const updateValue = (!isTouch) ? pixelToStep.getValue(vertical ? e.clientY : e.pageX) : pixelToStep.getValue(getTouchPosition(vertical, e))

    let offsets = offsetValues
    if (!offsetValues) {
      const currValues = curr.map(v => v.val)
      offsets = [-(updateValue - min(currValues)), max(currValues) - updateValue]
      this.setState({ offsetValues: offsets })
    }

    if (updateValue !== prevDragValue) {
      // Store current drag value for next calculation
      this.setState({ prevDragValue: updateValue })

      // sort handlers
      curr.sort((a, b) => a.val - b.val)

      // Apply offsets
      const values = []
      const next = curr.map((h, i) => {
        const nextVal = updateValue + offsets[i]
        values.push(nextVal)
        return {
          ...h,
          val: nextVal
        }
      })

      if (min(values) >= domain[0] && max(values) <= domain[1]) {
        this.submitUpdate(next, true)
      }
    }
  }

  onTrackMouseUp (event) {
    this.setState({ dragRefValue: null, offsetValues: null })
    if (isBrowser) {
      document.removeEventListener('mousemove', this.onTrackEventMove)
      document.removeEventListener('mouseup', this.onTrackMouseUp)
    }
  }

  onTrackTouchEnd (event) {
    this.setState({ dragRefValue: null, offsetValues: null })
    if (isBrowser) {
      document.removeEventListener('touchmove', this.onTrackEventMove)
      document.removeEventListener('touchend', this.onTrackMouseUp)
    }
  }

  addTrackMouseEvents () {
    if (isBrowser) {
      document.addEventListener('mousemove', this.onTrackEventMove)
      document.addEventListener('mouseup', this.onTrackMouseUp)
    }
  }

  addTrackTouchEvents () {
    if (isBrowser) {
      document.addEventListener('touchmove', this.onTrackEventMove)
      document.addEventListener('touchend', this.onTrackTouchEnd)
    }
  }
}
