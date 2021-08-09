import React, { useEffect, forwardRef } from "react";
import ReactDOM from "react-dom";
import { createPortal } from "react-dom";
import { X_svg } from "./Elements";

export const Modal = forwardRef(
  (
    {
      containerClass,
      open,
      setOpen,
      children,
      className,
      onBackdropClick,
      backdropClass,
      style,
      head,
      label,
    },
    ref
  ) => {
    useEffect(() => {
      if (!containerClass) return;
      const portal = document.querySelector("#portal");
      portal.classList.add(containerClass);
      return () => portal.classList.remove(containerClass);
    });
    if (!open) return null;
    return createPortal(
      <>
        <div
          className={`modalBackdrop ${backdropClass}`}
          onClick={(e) => {
            e.stopPropagation();
            onBackdropClick?.();
          }}
        />
        <div
          style={{ ...style }}
          ref={ref}
          className={`modal ${className || ""}`}
        >
          {head && (
            <div className="head">
              <p className="modalName">{label}</p>
              <button onClick={() => setOpen?.(false)}>
                <X_svg />
              </button>
            </div>
          )}
          {children}
        </div>
      </>,
      document.querySelector("#portal")
    );
  }
);

export const Confirm = ({ className, label, question, callback }) => {
  const cleanup = () =>
    ReactDOM.render(<></>, document.querySelector("#confirm"));
  const confirm = () => {
    callback();
    cleanup();
  };
  const decline = () => cleanup();
  ReactDOM.render(
    <>
      <div className={`modalBackdrop`} />
      <div className={`modal confirm ${className || ""}`}>
        <div className="head">
          <p className="modalName">{label}</p>
          <button onClick={decline}>
            <X_svg />
          </button>
        </div>
        <div className="content">
          <p className="question">{question}</p>
          <div className="actions">
            <button className="yes" onClick={confirm}>
              Confirm
            </button>
            <button className="no" onClick={decline}>
              Decline
            </button>
          </div>
        </div>
      </div>
    </>,
    document.querySelector("#confirm")
  );
};
