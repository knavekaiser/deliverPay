import { useState, useRef, useLayoutEffect } from "react";
import tick from "../tick.svg";
import tick_border from "../tick_border.svg";
import { Modal } from "./Modal";
require("./styles/elements.scss");

export const Err_svg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="158"
      height="158"
      viewBox="0 0 158 158"
    >
      <defs>
        <linearGradient
          id="linear-gradient-red"
          x1="-0.298"
          y1="-0.669"
          x2="1.224"
          y2="1.588"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#f93389" />
          <stop offset="1" stopColor="#e3003e" />
        </linearGradient>
      </defs>
      <rect
        id="Rectangle_1104"
        data-name="Rectangle 1104"
        width="158"
        height="158"
        rx="79"
        fill="url(#linear-gradient-red)"
      />
      <g
        id="Component_85_8"
        data-name="Component 85 – 8"
        transform="translate(49.472 49.472)"
      >
        <path
          id="Union_3"
          data-name="Union 3"
          d="M29.527,34.9,5.368,59.057,0,53.686,24.158,29.527,0,5.368,5.368,0l24.16,24.158L53.686,0l5.371,5.368L34.9,29.527l24.16,24.158-5.371,5.371Z"
          fill="#fff"
        />
      </g>
    </svg>
  );
};
export const Succ_svg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="158"
      height="158"
      viewBox="0 0 158 158"
    >
      <defs>
        <linearGradient
          id="linear-gradient"
          x1="-0.298"
          y1="-0.669"
          x2="1.224"
          y2="1.588"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#336cf9" />
          <stop offset="1" stopColor="#1be6d6" />
        </linearGradient>
        <clipPath id="clip-path">
          <rect width="64" height="64" fill="none" />
        </clipPath>
      </defs>
      <g
        id="Group_163"
        data-name="Group 163"
        transform="translate(-0.426 -0.384)"
      >
        <g id="Group_103" data-name="Group 103" transform="translate(0 0)">
          <rect
            id="Rectangle_1104"
            data-name="Rectangle 1104"
            width="158"
            height="158"
            rx="79"
            transform="translate(0.426 0.384)"
            fill="url(#linear-gradient)"
          />
        </g>
        <g
          id="Component_148_2"
          data-name="Component 148 – 2"
          transform="translate(47.426 58.384)"
          clipPath="url(#clip-path)"
        >
          <rect
            id="Rectangle_460"
            data-name="Rectangle 460"
            width="64"
            height="64"
            transform="translate(0 0)"
            fill="none"
          />
          <path
            id="Checkbox"
            d="M25.35,44.087,0,18.737l5.143-5.143L25.35,33.432,58.782,0l5.143,5.143Z"
            transform="translate(0 1.728)"
            fill="#fff"
          />
        </g>
      </g>
    </svg>
  );
};
export const X_svg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15.557"
      height="15.557"
      viewBox="0 0 15.557 15.557"
    >
      <defs>
        <clipPath id="clip-path">
          <rect width="15.557" height="15.557" fill="none" />
        </clipPath>
      </defs>
      <g id="Cancel" clipPath="url(#clip-path)">
        <path
          id="Union_3"
          data-name="Union 3"
          d="M7.778,9.192,1.414,15.557,0,14.142,6.364,7.778,0,1.414,1.414,0,7.778,6.364,14.142,0l1.415,1.414L9.192,7.778l6.364,6.364-1.415,1.415Z"
          fill="#2699fb"
        />
      </g>
    </svg>
  );
};

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
