import {
  useState,
  useRef,
  useLayoutEffect,
  useEffect,
  useContext,
  lazy,
} from "react";
import { SiteContext } from "../SiteContext";
import { Modal } from "./Modal";
import { Link, useHistory } from "react-router-dom";
import { CartItem } from "./Marketplace";
import { ProfileAvatar } from "./Account";

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

export const Step_tick = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="65"
      height="65"
      viewBox="0 0 65 65"
    >
      <g
        id="Ellipse_110"
        data-name="Ellipse 110"
        fill="#fff"
        stroke="#336cf9"
        strokeWidth="1"
      >
        <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
        <circle cx="32.5" cy="32.5" r="32" fill="none" />
      </g>
      <path
        id="Checkbox"
        d="M12.267,23.067,0,9.8,2.489,7.112l9.778,10.38L28.444,0l2.489,2.691Z"
        transform="translate(17.034 20.967)"
        fill="#336cf9"
      />
    </svg>
  );
};
export const Step_blank = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="65"
      height="65"
      viewBox="0 0 65 65"
    >
      <g
        id="Ellipse_229"
        data-name="Ellipse 229"
        fill="#fff"
        stroke="#707070"
        strokeWidth="1"
      >
        <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
        <circle cx="32.5" cy="32.5" r="32" fill="none" />
      </g>
    </svg>
  );
};
export const Step_fill = ({ className }) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="65"
      height="65"
      viewBox="0 0 65 65"
    >
      <g
        id="Ellipse_110"
        data-name="Ellipse 110"
        fill="#336cf9"
        stroke="#336cf9"
        strokeWidth="1"
      >
        <circle cx="32.5" cy="32.5" r="32.5" stroke="none" />
        <circle cx="32.5" cy="32.5" r="32" fill="none" />
      </g>
      <path
        id="Checkbox"
        d="M12.267,23.067,0,9.8,2.489,7.112l9.778,10.38L28.444,0l2.489,2.691Z"
        transform="translate(17.034 20.967)"
        fill="#fff"
      />
    </svg>
  );
};

export const Prog_done = () => {
  return (
    <svg
      className="done"
      xmlns="http://www.w3.org/2000/svg"
      width="214.5"
      height="2"
      viewBox="0 0 214.5 2"
    >
      <line
        id="Line_22"
        data-name="Line 22"
        x2="214.5"
        transform="translate(0 1)"
        fill="none"
        stroke="#1be6d6"
        strokeWidth="2"
      />
    </svg>
  );
};
export const Prog_running = () => {
  return (
    <svg
      className="running"
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="16.55"
      viewBox="0 0 200 16.55"
    >
      <g
        id="Group_203"
        data-name="Group 203"
        transform="translate(-5063.943 -1197)"
      >
        <path
          id="Path_301"
          data-name="Path 301"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5063.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_302"
          data-name="Path 302"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5073.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_303"
          data-name="Path 303"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5083.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_304"
          data-name="Path 304"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5093.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_305"
          data-name="Path 305"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5103.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_306"
          data-name="Path 306"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5113.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_307"
          data-name="Path 307"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5123.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_308"
          data-name="Path 308"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5133.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_309"
          data-name="Path 309"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5143.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_310"
          data-name="Path 310"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5153.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_311"
          data-name="Path 311"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5163.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_312"
          data-name="Path 312"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5173.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_313"
          data-name="Path 313"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5183.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_314"
          data-name="Path 314"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5193.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_315"
          data-name="Path 315"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5203.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_316"
          data-name="Path 316"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5213.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_317"
          data-name="Path 317"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5223.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_318"
          data-name="Path 318"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5233.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_319"
          data-name="Path 319"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5243.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
        <path
          id="Path_320"
          data-name="Path 320"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5253.943 1213.55) rotate(-90)"
          fill="#1be6d6"
        />
      </g>
    </svg>
  );
};
export const Prog_runningBack = () => {
  return (
    <svg
      className="runningBack"
      xmlns="http://www.w3.org/2000/svg"
      width="200"
      height="16.55"
      viewBox="0 0 200 16.55"
    >
      <g
        id="Group_226"
        data-name="Group 226"
        transform="translate(5263.943 1213.55) rotate(-180)"
      >
        <path
          id="Path_301"
          data-name="Path 301"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5063.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_302"
          data-name="Path 302"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5073.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_303"
          data-name="Path 303"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5083.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_304"
          data-name="Path 304"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5093.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_305"
          data-name="Path 305"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5103.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_306"
          data-name="Path 306"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5113.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_307"
          data-name="Path 307"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5123.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_308"
          data-name="Path 308"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5133.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_309"
          data-name="Path 309"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5143.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_310"
          data-name="Path 310"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5153.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_311"
          data-name="Path 311"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5163.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_312"
          data-name="Path 312"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5173.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_313"
          data-name="Path 313"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5183.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_314"
          data-name="Path 314"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5193.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_315"
          data-name="Path 315"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5203.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_316"
          data-name="Path 316"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5213.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_317"
          data-name="Path 317"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5223.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_318"
          data-name="Path 318"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5233.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_319"
          data-name="Path 319"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5243.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
        <path
          id="Path_320"
          data-name="Path 320"
          d="M8.275,10,0,2.3,2.465,0l5.81,5.41L14.085,0,16.55,2.3Z"
          transform="translate(5253.943 1213.55) rotate(-90)"
          fill="#f6577c"
        />
      </g>
    </svg>
  );
};

export const Plus_svg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <line
        id="Line_29"
        data-name="Line 29"
        y2="20"
        transform="translate(10)"
        fill="none"
        stroke="#006dff"
        strokeWidth="2"
      />
      <line
        id="Line_30"
        data-name="Line 30"
        x2="20"
        transform="translate(0 10)"
        fill="none"
        stroke="#006dff"
        strokeWidth="2"
      />
    </svg>
  );
};
export const Minus_svg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
    >
      <line
        id="Line_30"
        data-name="Line 30"
        x2="20"
        transform="translate(0 10)"
        fill="none"
        stroke="#006dff"
        strokeWidth="2"
      />
    </svg>
  );
};
export const Arrow_up_svg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
    >
      <g
        id="Symbol_82"
        data-name="Symbol 82"
        transform="translate(-507 1272) rotate(-90)"
      >
        <path
          id="Path_10"
          data-name="Path 10"
          d="M9,0,7.364,1.636l6.195,6.195H0v2.338H13.558L7.364,16.364,9,18l9-9Z"
          transform="translate(1254 507)"
          fill="#336cf9"
        />
      </g>
    </svg>
  );
};
export const Arrow_down_svg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
    >
      <g id="_1" data-name=" 1" transform="translate(525 -1254) rotate(90)">
        <path
          id="Path_10"
          data-name="Path 10"
          d="M9,0,7.364,1.636l6.195,6.195H0v2.338H13.558L7.364,16.364,9,18l9-9Z"
          transform="translate(1254 507)"
          fill="#ff0080"
        />
      </g>
    </svg>
  );
};
export const Arrow_left_svg = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
    >
      <path
        id="Path_10"
        data-name="Path 10"
        d="M8,0,6.545,1.455l5.506,5.506H0V9.039H12.052L6.545,14.545,8,16l8-8Z"
        transform="translate(16 16) rotate(180)"
        fill="#2699fb"
      />
    </svg>
  );
};
export const Chev_down_svg = ({ className }) => {
  return (
    <svg
      className={className || ""}
      xmlns="http://www.w3.org/2000/svg"
      width="23.616"
      height="13.503"
      viewBox="0 0 23.616 13.503"
    >
      <path
        id="Icon_ionic-ios-arrow-down"
        data-name="Icon ionic-ios-arrow-down"
        d="M18,20.679l8.93-8.937a1.681,1.681,0,0,1,2.384,0,1.7,1.7,0,0,1,0,2.391L19.2,24.258a1.685,1.685,0,0,1-2.327.049L6.68,14.14a1.688,1.688,0,0,1,2.384-2.391Z"
        transform="translate(-6.188 -11.246)"
        fill="#53aefc"
      />
    </svg>
  );
};

export const External_link_icon = () => {
  return (
    <span className="externalLinkIcon" aria-label="(opens a new window)">
      <svg
        viewBox="0 0 20 20"
        className="Polaris-Icon__Svg_375hu"
        focusable="false"
        aria-hidden="true"
      >
        <path d="M14 13v1a1 1 0 0 1-1 1H6c-.575 0-1-.484-1-1V7a1 1 0 0 1 1-1h1c1.037 0 1.04 1.5 0 1.5-.178.005-.353 0-.5 0v6h6V13c0-1 1.5-1 1.5 0zm-3.75-7.25A.75.75 0 0 1 11 5h4v4a.75.75 0 0 1-1.5 0V7.56l-3.22 3.22a.75.75 0 1 1-1.06-1.06l3.22-3.22H11a.75.75 0 0 1-.75-.75z"></path>
      </svg>
    </span>
  );
};

export const Tick = () => {
  return (
    <svg
      className="tick"
      xmlns="http://www.w3.org/2000/svg"
      width="15.1"
      height="10.8"
      viewBox="0 0 15.1 10.8"
    >
      <path
        id="Path_207"
        data-name="Path 207"
        d="M6.5,10.8,0,4.3,2.1,2.2,6.5,6.5,13,0l2.1,2.1Z"
        fill="#2699fb"
      />
    </svg>
  );
};
export const Cart_svg = () => {
  return (
    <svg
      version="1.1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 122.9 107.5"
    >
      <g>
        <path d="M3.9,7.9C1.8,7.9,0,6.1,0,3.9C0,1.8,1.8,0,3.9,0h10.2c0.1,0,0.3,0,0.4,0c3.6,0.1,6.8,0.8,9.5,2.5c3,1.9,5.2,4.8,6.4,9.1 c0,0.1,0,0.2,0.1,0.3l1,4H119c2.2,0,3.9,1.8,3.9,3.9c0,0.4-0.1,0.8-0.2,1.2l-10.2,41.1c-0.4,1.8-2,3-3.8,3v0H44.7 c1.4,5.2,2.8,8,4.7,9.3c2.3,1.5,6.3,1.6,13,1.5h0.1v0h45.2c2.2,0,3.9,1.8,3.9,3.9c0,2.2-1.8,3.9-3.9,3.9H62.5v0 c-8.3,0.1-13.4-0.1-17.5-2.8c-4.2-2.8-6.4-7.6-8.6-16.3l0,0L23,13.9c0-0.1,0-0.1-0.1-0.2c-0.6-2.2-1.6-3.7-3-4.5 c-1.4-0.9-3.3-1.3-5.5-1.3c-0.1,0-0.2,0-0.3,0H3.9L3.9,7.9z M96,88.3c5.3,0,9.6,4.3,9.6,9.6c0,5.3-4.3,9.6-9.6,9.6 c-5.3,0-9.6-4.3-9.6-9.6C86.4,92.6,90.7,88.3,96,88.3L96,88.3z M53.9,88.3c5.3,0,9.6,4.3,9.6,9.6c0,5.3-4.3,9.6-9.6,9.6 c-5.3,0-9.6-4.3-9.6-9.6C44.3,92.6,48.6,88.3,53.9,88.3L53.9,88.3z M33.7,23.7l8.9,33.5h63.1l8.3-33.5H33.7L33.7,23.7z" />
      </g>
    </svg>
  );
};

export const Img = ({ src: defaultSrc, ...rest }) => {
  const [src, setSrc] = useState(defaultSrc);
  return (
    <img
      src={src}
      onError={() => setSrc("/img_err.png")}
      {...rest}
      onClick={rest.onClick || function () {}}
    />
  );
};

export const Checkbox = ({ defaultValue, value, required, onChange }) => {
  const [checked, setChecked] = useState(!!defaultValue);
  useEffect(() => {
    setChecked(value);
  }, [value]);
  return (
    <section className="checkbox">
      <div className="ticks" onClick={() => setChecked(!checked)}>
        <input
          type="checkbox"
          value={checked}
          required={required}
          onChange={(e) => {
            setChecked(!checked);
            onChange?.(!checked);
          }}
        />
        <svg
          className="border"
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 30 30"
        >
          <g
            id="Rectangle_661"
            data-name="Rectangle 661"
            fill="none"
            stroke="#7fc4fd"
            strokeWidth="3"
          >
            <rect width="30" height="30" rx="4" stroke="none" />
            <rect x="1.5" y="1.5" width="27" height="27" rx="2.5" fill="none" />
          </g>
        </svg>
        {checked && <Tick />}
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
    } else if (options.find((item) => item.value === defaultValue)) {
      return options.find((item) => item.value === defaultValue).label;
    } else if (typeof defaultValue === "object") {
      return defaultValue.label;
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
export const NumberInput = ({
  defaultValue,
  min,
  max,
  required,
  onChange,
  step,
  placeholder,
  readOnly,
}) => {
  const [value, setValue] = useState(defaultValue || 0);
  return (
    <section className="number">
      <input
        type="number"
        step={step || "0.01"}
        required={required}
        value={value}
        readOnly={readOnly}
        onChange={(e) => {
          setValue((+e.target.value).toString());
          onChange?.(e);
        }}
        placeholder={placeholder || "0.00"}
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
export const FileInput = ({
  required,
  onChange,
  prefill,
  label,
  multiple,
  accept,
  name,
}) => {
  const [files, setFiles] = useState(prefill || []);
  useEffect(() => {
    onChange?.(files);
  }, [files]);
  return (
    <section className="fileInput">
      {files.map((item, fileIndex) => {
        const file =
          typeof item === "string"
            ? {
                type: "url",
                url: item,
              }
            : {
                type: item.type,
                name: item.name,
                url: URL.createObjectURL(item),
              };
        const img =
          file.type.startsWith("image") ||
          file.url.match(/(\.gif|\.png|\.jpg|\.jpeg|\.webp)$/);
        return (
          <div key={fileIndex} className={`file ${img ? "thumb" : "any"}`}>
            <button
              className="close"
              type="button"
              onClick={() =>
                setFiles((prev) => prev.filter((item, i) => i !== fileIndex))
              }
            >
              <X_svg />
            </button>
            <Img
              className={img ? "thumb" : ""}
              src={img ? file.url : "/file_icon.png"}
            />
            {!img && <p className="filename">{item.name}</p>}
          </div>
        );
      })}
      <div className="uploadBtn">
        <Plus_svg />
        <input
          name={name}
          type="file"
          multiple={multiple}
          required={required}
          accept={accept}
          onChange={(e) => {
            setFiles((prev) => [
              ...prev,
              ...[...e.target.files].filter(
                (item) => !files.some((file) => file.name === item.name)
              ),
            ]);
          }}
        />
      </div>
    </section>
  );
};

export const useOnScreen = (options) => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, options);
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);
  return [ref, visible];
};

export const Pagination = ({
  total,
  btns,
  perPage,
  currentPage,
  setCurrentPage,
  setPage,
}) => {
  const [pages, setPages] = useState([]);
  const [links, setLinks] = useState([]);
  useEffect(() => {
    setPages(
      [...Array(Math.ceil(total / perPage)).keys()].map((num) => num + 1)
    );
    setLinks([...Array(btns).keys()].map((num) => num + 1));
  }, [total, perPage]);
  if (total <= perPage) {
    return <></>;
  }
  return (
    <div className="pagination">
      <button
        disabled={currentPage <= 1}
        onClick={() => setPage((prev) => prev - 1)}
      >
        {"<"}
      </button>
      <ul className="pages">
        {pages.length <= btns &&
          pages.map((item) => (
            <li key={item} className={item === +currentPage ? "active" : ""}>
              <button onClick={() => setPage(item)}>{item}</button>
            </li>
          ))}
        {pages.length > btns &&
          links.map((item) => {
            const remain = pages.length - btns;
            const middle = Math.ceil(btns / 2);
            let pivit = 0;
            if (currentPage > middle) {
              if (currentPage - middle + btns <= pages.length) {
                pivit = currentPage - middle;
              } else {
                pivit = remain;
              }
            }
            const num = item + pivit;
            return (
              <li key={num} className={num === currentPage ? "active" : ""}>
                <button onClick={() => setPage(item)}>{num}</button>
              </li>
            );
          })}
      </ul>
      <button
        disabled={currentPage >= pages.length}
        onClick={() => setPage((prev) => prev + 1)}
      >
        {">"}
      </button>
    </div>
  );
};

export const Header = () => {
  const { user, setUser, cart, setCart, userType } = useContext(SiteContext);
  const history = useHistory();
  const [noti, setNoti] = useState(false);
  useEffect(() => {
    fetch("/api/authUser")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      });
  }, []);
  return (
    <header className="genericHeader">
      <Link className="logoLink" to="/">
        <Img className="logo" src="/logo_land.jpg" alt="Delivery pay logo" />
        <Img
          className="logo_small"
          src="/logo_sqr.jpg"
          alt="Delivery pay logo"
        />
      </Link>
      <div className="links">
        <Link to="/" className="home">
          Home
        </Link>
      </div>
      <div className="clas">
        {user ? (
          <ProfileAvatar key="genericHeader" />
        ) : (
          <>
            {history.location.pathname === "/u/login" ? (
              <Link to="/u/join">Register</Link>
            ) : (
              <Link to="/u/login">Login</Link>
            )}
          </>
        )}
      </div>
    </header>
  );
};
export const Footer = () => {
  return (
    <footer>
      <div className="links">
        <Link to="/aboutUs">About us</Link>
        <Link to="/privacyPolicy">Privacy Policy</Link>
        <Link to="/codeOfConduct">Code of Conduct</Link>
        <Link to="/copyrightPolicy">Copyright Policy</Link>
        <Link to="/fees&Charges">Fees & Charges</Link>
        <Link to="/terms">User Agreement</Link>
        <Link to="/howItWorks">How it works</Link>
        <Link to="/contactUs">Contact us</Link>
        <Link to="/employment-opportunities">Work with us</Link>
        <Link to="/refundCancellationPolicy">Refund & Cancellation Policy</Link>
        <Link to="/shippingDeliveryPolicy">Shipping & Delivery Policy</Link>
      </div>
    </footer>
  );
};

export const UploadFiles = ({ files, setMsg }) => {
  const cdn = process.env.REACT_APP_CDN_HOST;
  const formData = new FormData();
  const uploaded = [];
  for (var _file of files) {
    if (typeof _file === "string") {
      uploaded.push(_file);
    } else {
      formData.append("file", _file);
    }
  }
  return fetch(`${cdn}/upload`, {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.code === "ok") {
        return [...uploaded, ...data.files.map((link) => cdn + "/" + link)];
      } else {
        return null;
        setMsg(
          <>
            <button onClick={() => setMsg(null)}>Okay</button>
            <div>
              <Err_svg />
              <h4>File upload failed</h4>
            </div>
          </>
        );
      }
    })
    .catch((err) => {
      console.log(err);
      setMsg(
        <>
          <button onClick={() => setMsg(null)}>Okay</button>
          <div>
            <Err_svg />
            <h4>File upload failed. Make sure you're online.</h4>
          </div>
        </>
      );
    });
};
export const Media = ({ links }) => {
  const [mediaPreview, setMediaPreview] = useState(false);
  const [media, setMedia] = useState(null);
  const [index, setIndex] = useState(0);
  const medias =
    links?.map((item, i) => {
      let thumb = null;
      let view = null;
      const handleClick = (e) => {
        setMediaPreview(true);
        setMedia(view);
        setIndex(i);
      };
      if (
        item.match(/(\.gif|\.png|\.jpg|\.jpeg|\.webp)$/) ||
        item.startsWith("https://image")
      ) {
        thumb = (
          <Img
            className={index === i ? "active" : ""}
            key={i}
            src={item}
            onClick={handleClick}
          />
        );
        view = <Img key={i} src={item} />;
      } else if (item.match(/(\.mp3|\.ogg|\.amr|\.m4a|\.flac|\.wav|\.aac)$/i)) {
        thumb = (
          <div
            key={i}
            className={`audioThumb ${index === i ? "active" : ""}`}
            onClick={handleClick}
          >
            <Img src="/play_btn.png" />
          </div>
        );
        view = <audio key={i} src={item} controls="on" autoPlay="on" />;
      } else if (item.match(/(\.mp4|\.mov|\.avi|\.flv|\.wmv|\.webm)$/i)) {
        thumb = (
          <div key={i} className={`videoThumb ${index === i ? "active" : ""}`}>
            <video src={item} onClick={handleClick} />
            <Img src="/play_btn.png" />
          </div>
        );
        view = <video key={i} src={item} controls="on" autoPlay="on" />;
      } else {
        thumb = (
          <a key={i} href={i}>
            {item}
          </a>
        );
      }
      return thumb;
    }) || "N/A";
  return (
    <>
      {medias}
      <Modal
        className="mediaModal"
        open={mediaPreview}
        backdropClass="disputeMediaViewBack"
      >
        <button className="close" onClick={() => setMediaPreview(false)}>
          <X_svg />
        </button>
        <div className="view">{media}</div>
        <div className="thumbs">{medias}</div>
      </Modal>
    </>
  );
};

export const Actions = ({
  icon,
  children,
  className,
  wrapperClassName,
  clickable,
  onClick,
}) => {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const buttonRef = useRef();
  const wrapperRef = useRef();
  useLayoutEffect(() => {
    const { height, y, width, x } = buttonRef.current?.getBoundingClientRect();
    const bottom = window.innerHeight - (y + height);
    const wrapper = wrapperRef.current?.getBoundingClientRect();
    setStyle({
      position: "fixed",
      ...(wrapper?.height > bottom
        ? {
            bottom: window.innerHeight - y,
          }
        : {
            top: height + y + 4,
          }),
      right: window.innerWidth - x - width,
    });
  }, [open]);
  return (
    <div className={`actions ${className || ""}`}>
      <button
        type="button"
        className="btn"
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
          onClick?.();
        }}
      >
        {icon || <Img src="/menu_dot.png" />}
      </button>
      <Modal
        className="actions"
        backdropClass="actionsBackdrop"
        open={open}
        style={style}
        onBackdropClick={() => setOpen(false)}
      >
        <ul
          ref={wrapperRef}
          className={wrapperClassName}
          onClick={(e) => {
            e.stopPropagation();
            !clickable && setOpen(false);
          }}
        >
          {children}
        </ul>
      </Modal>
    </div>
  );
};
export const Tabs = ({ basepath, tabs }) => {
  const history = useHistory();
  return (
    <ul className="tabs">
      {tabs.map((item, i) => (
        <Link
          to={basepath + item.path}
          key={i}
          onClick={() => item.onClick?.()}
        >
          <li
            className={
              history.location.pathname.startsWith(basepath + item.path)
                ? "active"
                : ""
            }
          >
            {item.label}
          </li>
        </Link>
      ))}
    </ul>
  );
};

export const User = ({ user }) => {
  return (
    <div className="profile">
      <Img src={user.profileImg || "/profile-user.jpg"} />
      <p className="name">
        {user.name || user.firstName + " " + user.lastName}
        <span className="contact">{user.phone}</span>
      </p>
    </div>
  );
};

export const moment = ({ time, format }) => {
  if (new Date(time).toString() === "Invalid Date") {
    return time;
  }
  const options = {
    year: format.includes("YYYY") ? "numeric" : "2-digit",
    month: format.includes("MMMM")
      ? "long"
      : format.includes("MMM")
      ? "short"
      : format.includes("MM")
      ? "2-digit"
      : "numeric"
      ? "long"
      : format.includes("ddd")
      ? "short"
      : "narrow",
    weekday: format.includes("dddd")
      ? "long"
      : format.includes("ddd")
      ? "short"
      : "narrow",
    day: format.includes("DD") ? "2-digit" : "numeric",
    hour: format.includes("hh") ? "2-digit" : "numeric",
    minute: format.includes("mm") ? "2-digit" : "numeric",
    second: format.includes("ss") ? "2-digit" : "numeric",
  };
  const values = {};
  new Intl.DateTimeFormat("en-IN", options)
    .formatToParts(new Date(time || new Date()))
    .map(({ type, value }) => {
      values[type] = value;
    });
  return format
    .replace(/Y+/g, values.year)
    .replace(/M+/g, values.month)
    .replace(/D+/g, values.day)
    .replace(/h+/g, values.hour)
    .replace(/m+/g, values.minute)
    .replace(/s+/g, values.second)
    .replace(/a+/g, values.dayPeriod)
    .replace(/d+/g, values.weekday);
};
export const Moment = ({ format, children, ...rest }) => {
  return <time {...rest}>{moment({ time: children, format })}</time>;
};

export const calculatePrice = ({ product, gst, discount }) => {
  let finalPrice = product.price;
  if (discount !== false && product.discount?.amount) {
    finalPrice -= calculateDiscount(product);
  }
  if (gst?.verified) {
    finalPrice += finalPrice * ((product.gst || gst.amount) / 100);
  }
  if (gst === true) {
    finalPrice += finalPrice * (product.gst / 100);
  }
  return finalPrice.fix();
};
export const calculateDiscount = (product) => {
  const { discount, price } = product;
  if (discount?.amount) {
    if (discount.type === "flat") {
      return (+discount.amount).fix();
    } else if (discount.type === "percent") {
      return ((+price / 100) * discount.amount).fix();
    } else {
      return 0;
    }
  } else {
    return null;
  }
};
export const SS = {
  set: (key, value) => sessionStorage.setItem(key, value),
  get: (key) => sessionStorage.getItem(key),
  remove: (key) => sessionStorage.removeItem(key),
};
export const LS = {
  set: (key, value) => localStorage.setItem(key, value),
  get: (key) => localStorage.getItem(key),
  remove: (key) => localStorage.removeItem(key),
};
export const addToCart = (prev, product) => {
  if (prev.some((item) => item.product._id === product._id)) {
    return prev.map((item) => {
      if (item.product._id === product._id) {
        return {
          ...item,
          qty: item.qty + 1,
        };
      } else {
        return item;
      }
    });
  } else {
    return [...prev, { product, qty: 1 }];
  }
};

export const Tip = ({ className, children }) => {
  return (
    <Actions
      className={`${className || ""} tip`}
      wrapperClassName="tipWrapper"
      icon={<Img src="/help.png" />}
    >
      {children}
    </Actions>
  );
};
