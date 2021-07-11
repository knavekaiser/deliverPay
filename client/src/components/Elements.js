import { useState, useRef, useLayoutEffect } from "react";
import tick from "../tick.svg";
import tick_border from "../tick_border.svg";
import { Modal } from "./Modal";
require("./styles/elements.scss");

export const Checkbox = ({ defaultValue, required, onChange }) => {
  const [checked, setChecked] = useState(defaultValue);
  return (
    <section className="checkbox">
      <div className="ticks" onClick={() => setChecked(!checked)}>
        <input
          type="checkbox"
          value={checked}
          required={required}
          onChange={(e) => {
            setChecked(!checked);
            onChange?.(e);
          }}
        />
        <img src={tick_border} />
        {checked && <img src={tick} />}
      </div>
    </section>
  );
};
export const Combobox = ({
  options,
  defaultValue,
  onChange,
  maxHeight,
  required,
  disabled,
  dataId,
  validationMessage,
  className,
  placeholder,
}) => {
  const [value, setValue] = useState(() => {
    if (defaultValue > -1 && options[defaultValue]) {
      return options[defaultValue].label;
    } else if (typeof defaultValue === "object") {
      return defaultValue;
    } else {
      return "";
    }
  });
  const [open, setOpen] = useState(false);
  const [data, setData] = useState("");
  const [optionsStyle, setOptionsStyle] = useState({});
  const input = useRef();
  const section = useRef();
  useLayoutEffect(() => {
    const { width, height, x, y } = section.current.getBoundingClientRect();
    setOptionsStyle({
      position: "absolute",
      left: x,
      top: y + height,
      width: width,
      height: 37 * options.length,
      maxHeight: window.innerHeight - (y + height) - 16,
    });
  }, [open]);
  return (
    <section
      className={`combobox ${open ? "open" : ""}`}
      ref={section}
      onClick={() => setOpen(!open)}
    >
      {placeholder && !value && <label>{placeholder}</label>}
      <input
        ref={input}
        required={required}
        data={data}
        value={value}
        onFocus={(e) => e.target.blur()}
        onChange={() => {}}
      />
      <button type="button">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="8.872"
          viewBox="0 0 13 8.872"
        >
          <defs>
            <clipPath id="clip-path">
              <rect width="8.872" height="13" fill="none" />
            </clipPath>
          </defs>
          <g
            id="Component_47_7"
            data-name="Component 47 – 7"
            transform="translate(0 8.872) rotate(-90)"
            clipPath="url(#clip-path)"
          >
            <path
              id="Path_36"
              data-name="Path 36"
              d="M6.5,8.872,0,2.036,1.936,0,6.5,4.8,11.064,0,13,2.036Z"
              transform="translate(8.872) rotate(90)"
              fill="#336cf9"
            />
          </g>
        </svg>
      </button>
      <Modal
        className="sectionOptions"
        open={open}
        setOpen={setOpen}
        backdropClass="selectionOptionBack"
        onBackdropClick={() => setOpen(false)}
        style={optionsStyle}
      >
        <ul
          style={{
            width: "100%",
            maxHeight: open ? maxHeight : 0,
            zIndex: 100,
          }}
          className={"options"}
        >
          {options.map((option) => (
            <li
              key={option.label}
              onClick={(e) => {
                setData(option.value);
                setValue(option.label);
                onChange && onChange(option);
                setOpen(false);
                input.current.setCustomValidity("");
              }}
              className={`${"option"} ${
                value === option.label ? "selected" : ""
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </Modal>
    </section>
  );
};
export const NumberInput = ({ defaultValue, min, max, required, onChange }) => {
  const [value, setValue] = useState(defaultValue || 0);
  return (
    <section className="number">
      <input
        type="number"
        step="0.01"
        required={required}
        value={value}
        onChange={(e) => {
          setValue((+e.target.value).toString());
          onChange?.(e);
        }}
        placeholder="0.00"
        min={min}
        max={max}
      />
      <div className="ticker">
        <button type="button" onClick={() => setValue(+value + 1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="8.872"
            viewBox="0 0 13 8.872"
          >
            <defs>
              <clipPath id="clip-path">
                <rect width="8.872" height="13" fill="none" />
              </clipPath>
            </defs>
            <g
              id="Component_47_8"
              data-name="Component 47 – 8"
              transform="translate(13) rotate(90)"
              clipPath="url(#clip-path)"
            >
              <path
                id="Path_36"
                data-name="Path 36"
                d="M6.5,8.872,0,2.036,1.936,0,6.5,4.8,11.064,0,13,2.036Z"
                transform="translate(8.872) rotate(90)"
                fill="#336cf9"
              />
            </g>
          </svg>
        </button>
        <button type="button" onClick={() => setValue(+value - 1)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="13"
            height="8.872"
            viewBox="0 0 13 8.872"
          >
            <defs>
              <clipPath id="clip-path">
                <rect width="8.872" height="13" fill="none" />
              </clipPath>
            </defs>
            <g
              id="Component_47_7"
              data-name="Component 47 – 7"
              transform="translate(0 8.872) rotate(-90)"
              clipPath="url(#clip-path)"
            >
              <path
                id="Path_36"
                data-name="Path 36"
                d="M6.5,8.872,0,2.036,1.936,0,6.5,4.8,11.064,0,13,2.036Z"
                transform="translate(8.872) rotate(90)"
                fill="#336cf9"
              />
            </g>
          </svg>
        </button>
      </div>
    </section>
  );
};
