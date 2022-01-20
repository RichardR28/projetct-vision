import React from 'react';

export default function CustomField(props) {
  function handleChange(value) {
    if (props.onChange) {
      props.onChange(value);
    }
  }

  function onLeaveField(value) {
    if (props.onBlur) {
      props.onBlur(value);
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ textAlign: 'start' }}>{props.label || 'Custom Field'}:</div>
      <input
        id={props.id}
        name={props.name}
        onKeyPress={(e) => (props.onKeyPress ? props.onKeyPress(e) : () => {})}
        placeholder={props.placeholder || ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => onLeaveField(e.target.value)}
        value={props.value}
        type={props.type || 'text'}
        title={props.title || null}
        disabled={props.disabled || null}
        style={
          !props.disabled
            ? {
                height: 33,
                borderRadius: 5,
                border: 'solid 1px #00000078',
              }
            : {
                cursor: 'not-allowed',
                height: 33,
                borderRadius: 5,
                border: 'solid 1px rgb(0 0 0 / 24%)',
              }
        }
      />
    </div>
  );
}
