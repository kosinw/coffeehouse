import { useState } from "react";

function Counter() {
    const [counter, setCounter] = useState(0);

    function updateCounter() {
        setCounter(counter + 1); // counter++
    }

    return (
        <div>
            <span>{counter}</span>
            <button onClick={updateCounter}>+</button>
        </div>
    );
}

export default Counter;