import React from 'react'
import PropTypes from 'prop-types'

// *******************************************************
// RAIL
// *******************************************************
const railOuterStyle = {
  position: 'absolute',
  height: '100%',
  width: 42,
  transform: 'translate(-50%, 0%)',
  borderRadius: 7,
  cursor: 'pointer'
  //   zIndex: 3001
  // border: '1px solid white',

}

const railInnerStyle = {
  position: 'absolute',
  height: '100%',
  width: 5,
  transform: 'translate(-50%, 0%)',
  borderRadius: 7,
  pointerEvents: 'none',
  backgroundColor: 'rgb(255,255,255, 0.5)'
//   zIndex: 3001
}

export function SliderRail ({ getRailProps }) {
  return (
    <>
      <div style={railOuterStyle} {...getRailProps()} />
      <div style={railInnerStyle} />
    </>
  )
}

SliderRail.propTypes = {
  getRailProps: PropTypes.func.isRequired
}

// *******************************************************
// HANDLE COMPONENT
// *******************************************************
export function Handle ({
  domain: [min, max],
  handle: { id, value, percent },
  getHandleProps
}) {
  return (
    <>
      <div
        style={{
          top: `${percent}%`,
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          WebkitTapHighlightColor: 'rgba(0,0,0,0)',
          zIndex: 3009,
          width: 42,
          height: 28,
          cursor: 'pointer',
          // border: '1px solid white',
          backgroundColor: 'none'
        }}
        {...getHandleProps(id)}
      />
      <div
        role='slider'
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{
          top: `${percent}%`,
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          zIndex: 3008,
          width: 20,
          height: 20,
          borderRadius: '50%',
          boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.3)',
          backgroundColor: '#ffc400' // '#ffc400',
        }}
      />
    </>
  )
}

Handle.propTypes = {
  domain: PropTypes.array.isRequired,
  handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  getHandleProps: PropTypes.func.isRequired
}

// *******************************************************
// KEYBOARD HANDLE COMPONENT
// Uses button to allow keyboard events
// *******************************************************
export function KeyboardHandle ({
  domain: [min, max],
  handle: { id, value, percent },
  getHandleProps
}) {
  return (
    <button
      role='slider'
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{
        top: `${percent}%`,
        position: 'absolute',
        transform: 'translate(-50%, -50%)',
        width: 24,
        height: 24,
        zIndex: 5,
        cursor: 'pointer',
        border: 0,
        borderRadius: '50%',
        boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.3)',
        backgroundColor: '#ffc400'
      }}
      {...getHandleProps(id)}
    />
  )
}

KeyboardHandle.propTypes = {
  domain: PropTypes.array.isRequired,
  handle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  getHandleProps: PropTypes.func.isRequired
}

// *******************************************************
// TRACK COMPONENT
// *******************************************************
export function Track ({ source, target, getTrackProps }) {
  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 1,
        backgroundColor: '#ffc400', // 'rgba(230, 0, 126, 1)',
        borderRadius: 7,
        cursor: 'pointer',
        width: 5,
        transform: 'translate(-50%, 0%)',
        top: `${source.percent}%`,
        height: `${target.percent - source.percent}%`
      }}
      {...getTrackProps()}
    />
  )
}

Track.propTypes = {
  source: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  target: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  getTrackProps: PropTypes.func.isRequired
}

// *******************************************************
// TICK COMPONENT
// *******************************************************
export function Tick ({ tick, format }) {
  return (
    <div>
      <div
        style={{
          position: 'absolute',
          marginTop: -0.5,
          marginLeft: -20,
          height: 2,
          width: 8,
          backgroundColor: 'rgb(255,255,255, 0.7)',
          top: `${tick.percent}%`
        }}
      />
      <div
        style={{
          position: 'absolute',
          marginTop: -5,
          marginLeft: -55,
          fontSize: 14,
          top: `${tick.percent}%`,
          color: 'rgb(255,255,255, 0.58)',
          textAlign: 'left'
        }}
      >
        {format(tick.value)}
      </div>
    </div>
  )
}

Tick.propTypes = {
  tick: PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    percent: PropTypes.number.isRequired
  }).isRequired,
  format: PropTypes.func.isRequired
}

Tick.defaultProps = {
  format: d => d
}
