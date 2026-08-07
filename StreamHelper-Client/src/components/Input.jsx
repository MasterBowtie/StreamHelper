import { useEffect } from "react";
import { useState } from "react"

// Good for: 
// text
// number
// email
// password
// url
// search
// tel
// date
// time

export function Input({id, type="string", label, placeholder, value="", onChange=()=>{}}) {
    return (
        <>
            <label htmlFor={id}>
                {label}
            </label>

            <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={e=>{onChange(e.target.value)}}
            />
        </>
    )
}