import React from 'react';

const Slider = ({ label, value, onChange }) => {
    return (
        <div className="slider-container">
            <label>{label}</label>
            <input
                type="range"
                min="0"
                max="255"
                value={value}
                onChange={onChange}
                className="slider"
            />
            <span>{value}</span>
        </div>
    );
};

export default Slider;