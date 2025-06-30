import React from "react";
import { DefaultUserInput } from "./config/DefaultUserInput";
export default function InputPanel({
  userInput,
  setUserInput,
}) {
  // Configuration data for each geo-route-row
  const geoRouteConfig = [
    {
      key: 'elevationStart',
      label: 'Elevation Start',
      textColor: 'text-info',
      buttonColor: 'text-info',
      btnClass: 'add-anime-blue',
      iconColor: 'btn-info',
      icon: 'fa-arrow-up-from-bracket',
      inputId: 'user-base-height',
      min: 0,
      maxConstraint: 0
    },
    {
      key: 'elevationMid',
      label: 'Elevation Mid',
      textColor: 'text-info',
      buttonColor: 'text-info',
      btnClass: 'add-anime-blue',
      iconColor: 'btn-info',
      icon: 'fa-arrows-up-to-line',
      inputId: 'user-top-height',
      min: 1,
      maxConstraint: 1
    },
    {
      key: 'elevationEnd',
      label: 'Elevation End',
      textColor: 'text-info',
      buttonColor: 'text-info',
      btnClass: 'add-anime',
      iconColor: 'btn-info',
      icon: 'fa-text-width',
      inputId: 'user-tolerance-w',
      min: 1,
      maxConstraint: 1
    },
    {
      key: 'stepCount',
      label: 'Step Count',
      textColor: 'text-success',
      buttonColor: 'text-success',
      btnClass: 'add-anime',
      iconColor: 'btn-success',
      icon: 'fa-arrows-turn-to-dots',
      inputId: 'user-step-count',
      min: 1,
      maxConstraint: 1
    },
    {
      key: 'angleCourse',
      label: 'Angle Course',
      textColor: 'text-success',
      buttonColor: 'text-success',
      btnClass: 'add-anime',
      iconColor: 'btn-success',
      icon: 'fa-text-width',
      inputId: 'user-tolerance-w',
      min: 1,
      maxConstraint: 1
    }
  ];

  const handleDecrement = (key, maxConstraint) => {
    setUserInput({
      ...userInput,
      [key]: Math.max(maxConstraint, userInput[key] - 1),
    });
  };

  const handleIncrement = (key) => {
    setUserInput({
      ...userInput,
      [key]: userInput[key] + 1,
    });
  };

  const handleInputChange = (key, value) => {
    setUserInput({
      ...userInput,
      [key]: Number(value),
    });
  };

  return (
    <div id="geo-route-panel">
      {geoRouteConfig.map((config) => (
        <span key={config.key} className="geo-route-row">
          <p className={`${config.textColor} mb-0`}>{config.label}</p>
          <div className="custom-input-group input-group input-group-sm">
            <div className="input-group-prepend">
              <button
                className={`geo-btn ${config.btnClass} btn btn-primary ${config.buttonColor}`}
                onClick={() => handleDecrement(config.key, config.maxConstraint)}
              >
                <i className="fa fa-minus"></i>
              </button>
              <div className={`btn ${config.iconColor} disabled text-primary opac`}>
                <i className={`geo-icons fa fa-fw ${config.icon}`}></i>
              </div>
            </div>
            <input
              id={config.inputId}
              min={config.min}
              value={userInput[config.key]}
              onChange={(e) => handleInputChange(config.key, e.target.value)}
              className={`geo-input-el px-0 text-center form-control ${config.textColor} bg-primary border-0`}
            />
            <div className="input-group-append">
              <button
                className={`geo-btn ${config.btnClass} btn btn-primary ${config.buttonColor}`}
                onClick={() => handleIncrement(config.key)}
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
        </span>
      ))}
    </div>
  );
}
