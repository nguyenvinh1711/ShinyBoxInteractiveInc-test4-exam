// * Custom hook to get the previous value of a state
import { useRef, useEffect } from "react";

export default function usePrevious(value) {
    const ref = useRef(value);
    // * This runs after every render when the "value" changes 
    useEffect(() => {
        ref.current = value;
    }, [value]);

    // console.log("ref.current", ref.current);
    // * Return the previous value
    return ref.current;
}   