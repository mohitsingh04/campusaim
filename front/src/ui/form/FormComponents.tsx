"use client";
import { useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { LuEye, LuEyeOff } from "react-icons/lu";
import React from "react";

export const InputGroup = ({
  label,
  id,
  type = "text",
  placeholder = "",
  onChange,
  onFocus,
  onBlur,
  value,
  disable = false,
}: {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  id?: string;
  disable?: boolean;
}) => (
  <div>
    <label htmlFor={id} className="block text-xs text-(--text-color) mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      placeholder={placeholder}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      value={value}
      disabled={disable}
      className="w-full paragraph px-4 py-1.5 border border-(--border) rounded-custom 
      focus:ring-1 focus:ring-(--border) focus:outline-none 
      text-(--text-color-emphasis) bg-transparent disabled:cursor-not-allowed"
    />
  </div>
);

/* --------------------------------------------------------
   TEXTAREA GROUP
--------------------------------------------------------- */
export const TextareaGroup = ({
  label,
  id,
  placeholder = "",
  rows = 4,
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  label?: string;
  id?: string;
  placeholder?: string;
  value: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}) => (
  <div>
    <label htmlFor={id} className="block paragraph text-(--text-color) mb-1">
      {label}
    </label>
    <textarea
      id={id}
      placeholder={placeholder}
      rows={rows}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      name={id}
      value={value}
      className="w-full paragraph px-4 py-2 border border-(--border) rounded-custom 
                 focus:ring-1 focus:ring-(--border) focus:outline-none 
                 bg-transparent resize-none text-(--text-color-emphasis)"
    ></textarea>
  </div>
);

/* --------------------------------------------------------
   SELECT GROUP
--------------------------------------------------------- */
export const SelectGroup = ({
  label,
  id,
  options,
  placeholder,
  onChange,
  onFocus,
  onBlur,
  value,
}: {
  label?: string;
  id?: string;
  options: string[];
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
}) => (
  <div>
    <label htmlFor={id} className="block text-xs text-(--text-color) mb-1">
      {label}
    </label>

    <div className="relative">
      <select
        id={id}
        value={value}
        className="w-full text-xs border border-(--border) bg-(--secondary-bg) 
        text-(--text-color-emphasis) rounded-custom p-2 appearance-none 
        focus:ring-1 focus:ring-(--border) outline-none"
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <option value="" disabled>
          {placeholder || "Select an option..."}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <BiChevronDown className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  </div>
);

/* --------------------------------------------------------
   CHECKBOX GROUP
--------------------------------------------------------- */
export const CheckboxGroup = ({
  label,
  id,
  defaultChecked = false,
  description,
}: {
  label?: string;
  id?: string;
  defaultChecked?: boolean;
  description?: string;
}) => (
  <div className="flex items-start">
    <div className="flex items-center h-5">
      <input
        id={id}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="w-4 h-4 border-blue-600 rounded focus:ring-blue-500"
      />
    </div>

    <div className="ml-3 text-sm">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      {description && <p>{description}</p>}
    </div>
  </div>
);

/* --------------------------------------------------------
   RANGE SLIDER
--------------------------------------------------------- */
export const RangeSlider = ({
  label,
  description,
  defaultValue,
  showValueBox = false,
  valueText = "",
}: {
  label?: string;
  description?: string;
  defaultValue?: number;
  showValueBox?: boolean;
  valueText?: string;
}) => (
  <div>
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>

      {showValueBox && (
        <span className="text-sm font-semibold text-white bg-gray-700 px-3 py-1 rounded-md">
          {valueText}
        </span>
      )}
    </div>

    <input
      type="range"
      min="0"
      max="100"
      defaultValue={defaultValue}
      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
      style={
        {
          "--thumb-color": "white",
          "--thumb-border": "#374151",
        } as React.CSSProperties
      }
    />

    <style>{`
     .range-thumb::-webkit-slider-thumb {
       -webkit-appearance: none;
       width: 20px;
       height: 20px;
       background: var(--thumb-color);
       border: 4px solid var(--thumb-border);
       border-radius: 50%;
       cursor: pointer;
       margin-top: -6px;
     }
     .range-thumb::-moz-range-thumb {
       width: 12px;
       height: 12px;
       background: var(--thumb-color);
       border: 4px solid var(--thumb-border);
       border-radius: 50%;
     }
    `}</style>

    <p className="text-sm text-gray-400 mt-2">{description}</p>
  </div>
);

export const PasswordInputGroup = ({
  label,
  id,
  placeholder = "",
  value,
  onChange,
  onFocus,
  onBlur,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  id?: string;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-xs text-(--text-color) mb-1">
          {label}
        </label>
      )}

      {/* FIXED: Wrapper controls icon alignment always */}
      <div className="relative flex items-center">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          name={id}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="w-full paragraph px-4 py-1.5 pr-10 border border-(--border)
            rounded-custom focus:ring-1 focus:ring-(--border) focus:outline-none
            text-(--text-color-emphasis) bg-transparent"
        />

        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-3 text-(--text-color-emphasis) cursor-pointer"
        >
          {showPassword ? <LuEyeOff size={18} /> : <LuEye size={18} />}
        </button>
      </div>
    </div>
  );
};
