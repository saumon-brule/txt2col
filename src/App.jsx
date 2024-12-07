import { useState, useEffect, useRef } from 'react'
import sha256 from 'js-sha256';
import './App.css'

function textToHSL(str, initialS = 0, initialL = 0, variationS = 100, variationL = 100) {
    const int = parseInt(sha256(str), 16)
    const l = int % 10000
    const h = Math.round((int % (10 ** 8)) / (10 ** 4))
    const s = Math.round((int % (10 ** 12)) / (10 ** 8))
    return [360 * (h / 9999), initialS + variationS * (s / 9999), initialL + variationL * (l / 9999)] // [{0-360}, {70-100}, {40-70}]
}

function HSLToRGB(hsl) {
    const [H, s, l] = hsl
    const S = s / 100
    const L = l / 100
    const C = (1 - Math.abs(2 * L - 1)) * S
    const X = (1 - Math.abs(((H / 60) % 2) - 1)) * C
    const M = L - C / 2
    let pR;
    let pG;
    let pB;
    if (0 <= H < 60) {
        pR = C;
        pG = X;
        pB = 0;
    } else if (60 <= H < 120) {
        pR = X;
        pG = C;
        pB = 0;
    } else if (120 <= H < 240) {
        pR = 0;
        pG = C;
        pB = X;
    } else if (180 <= H < 240) {
        pR = 0;
        pG = X;
        pB = C;
    } else if (240 <= H < 300) {
        pR = X;
        pG = 0;
        pB = C;
    } else {
        pR = C;
        pG = 0;
        pB = X;
    }

    return [(pR + M) * 255, (pG + M) * 255, (pB + M) * 255]
}

function HSLToCSS(hsl) {
    const [h, s, l] = hsl
    return `hsl(${h}, ${s}%, ${l}%)`
}

function RGBToCSS(rgb) {
    const [r, g, b] = rgb
    return `rgb(${r}, ${g}, ${b})`
}

function RGBToHEX(rgb) {
    const [r, g, b] = rgb
    let xR = Math.round(r).toString(16)
    let xG = Math.round(g).toString(16)
    let xB = Math.round(b).toString(16)
    return `#${xR.length > 1 ? xR : "0" + xR}${xG.length > 1 ? xG : "0" + xG}${xB.length > 1 ? xB : "0" + xB}`.toUpperCase()
}


const placeholderStart = "Enter "
const placeholderEnd = " here"
const placeholders = [
    "something",
    "your name",
    "your pet name",
    "xX_4 w3!rd p53ud0nym3_Xx",
    "whatever you would like to give a random color",
    "random things",
]

const ANIMATION_START = 2300 // ms
const ANIMATION_END = 300 // ms

export default function App() {
    const [text, setText] = useState("");
    const [placeholder, setPlaceholder] = useState("text");
    const wordTimeoutIdRef = useRef(undefined);
    const letterIntervalIdsRef = useRef(undefined);
    const placeholderMirror = useRef(placeholder)
    const hslColor = textToHSL(text ? text.toLowerCase() : (placeholderStart + placeholder + placeholderEnd).toLowerCase());
    const rgbColor = HSLToRGB(hslColor)

    const rgbSliderRef = useRef(null);
    const isRgbSliderAnimationActive = useRef(false);
    const hexSliderRef = useRef(null);
    const isHexSliderAnimationActive = useRef(false);
    const hslSliderRef = useRef(null);
    const isHslSliderAnimationActive = useRef(false);

    useEffect(() => {
        document.body.style.backgroundColor = HSLToCSS(hslColor)
    }, [text, placeholder])

    useEffect(() => {
        placeholderMirror.current = placeholder
    }, [placeholder])

    useEffect(() => {
        setPlaceholder(placeholders[parseInt(Math.random() * placeholders.length)])
    }, [text])

    useEffect(() => {
        if (text === "") {
            if (!wordTimeoutIdRef.current && !letterIntervalIdsRef.current) {
                const wordInterval = 2000 + (Math.random() * 3000)
                const letterEraseInterval = 50 + (Math.random() * 100)
                const letterWriteInterval = 50 + (Math.random() * 50)
                const chosenPlaceholder = placeholders[parseInt(Math.random() * placeholders.length)]
                wordTimeoutIdRef.current = setTimeout(() => {
                    letterIntervalIdsRef.current = setInterval(() => {
                        if (placeholderMirror.current == "") {
                            clearInterval(letterIntervalIdsRef.current)
                            letterIntervalIdsRef.current = setInterval(() => {
                                if (placeholderMirror.current.length === chosenPlaceholder.length - 1) {
                                    clearInterval(letterIntervalIdsRef.current)
                                    letterIntervalIdsRef.current = undefined
                                    wordTimeoutIdRef.current = undefined
                                    setPlaceholder(chosenPlaceholder.slice(0, placeholderMirror.current.length + 1))
                                } else {
                                    setPlaceholder(chosenPlaceholder.slice(0, placeholderMirror.current.length + 1))
                                }
                            }, letterWriteInterval)
                        } else {
                            setPlaceholder(() => placeholderMirror.current.slice(0, -1))
                        }
                    }, letterEraseInterval)
                }, wordInterval)
            }
        } else {
            if (letterIntervalIdsRef.current) {
                clearInterval(letterIntervalIdsRef.current)
                letterIntervalIdsRef.current = undefined
            }
            if (wordTimeoutIdRef.current) {
                clearTimeout(wordTimeoutIdRef.current)
                wordTimeoutIdRef.current = undefined
            }
        }
    }, [text, placeholder, wordTimeoutIdRef, letterIntervalIdsRef])

    function handleColorClick(type) {
        switch (type) {
            case 0:
                navigator.clipboard.writeText(RGBToCSS([Math.round(rgbColor[0]), Math.round(rgbColor[1]), Math.round(rgbColor[2])]))
                    .then(() => {
                        if (!isRgbSliderAnimationActive.current) {
                            rgbSliderRef.current.classList.add("copied-start");
                            isRgbSliderAnimationActive.current = true;
                            setTimeout(() => {
                                rgbSliderRef.current.classList.remove("copied-start");
                                rgbSliderRef.current.classList.add("copied-end");
                                setTimeout(() => {
                                    rgbSliderRef.current.classList.remove("copied-end");
                                    isRgbSliderAnimationActive.current = false;
                                }, ANIMATION_END);
                            }, ANIMATION_START);
                        }
                    })
                    .catch(console.error);
                break;
            case 1:
                navigator.clipboard.writeText(RGBToHEX(rgbColor))
                    .then(() => {
                        if (!isHexSliderAnimationActive.current) {
                            hexSliderRef.current.classList.add("copied-start");
                            isHexSliderAnimationActive.current = true;
                            setTimeout(() => {
                                hexSliderRef.current.classList.remove("copied-start");
                                hexSliderRef.current.classList.add("copied-end");
                                setTimeout(() => {
                                    hexSliderRef.current.classList.remove("copied-end");
                                    isHexSliderAnimationActive.current = false;
                                }, ANIMATION_END);
                            }, ANIMATION_START);
                        }
                    })
                    .catch(console.error);
                break;
                case 2:
                    navigator.clipboard.writeText(HSLToCSS([Math.round(hslColor[0]), Math.round(hslColor[1]), Math.round(hslColor[2])]))
                    .then(() => {
                        if (!isHslSliderAnimationActive.current) {
                            hslSliderRef.current.classList.add("copied-start");
                            isHslSliderAnimationActive.current = true;
                            setTimeout(() => {
                                hslSliderRef.current.classList.remove("copied-start");
                                hslSliderRef.current.classList.add("copied-end");
                                setTimeout(() => {
                                    hslSliderRef.current.classList.remove("copied-end");
                                    isHslSliderAnimationActive.current = false;
                                }, ANIMATION_END);
                            }, ANIMATION_START);
                        }
                    })
                    .catch(console.error);
                break;
        }
    }

    return (
        <main>
            <div className="main-box">
                <h1>Awesome Text to Color Converter</h1>
                <input type="text" placeholder={placeholderStart + placeholder + placeholderEnd} onChange={(e) => { setText(e.target.value) }} />
            </div>
            <div className="color-container">
                <div className="rgb-color" onClick={() => handleColorClick(0)}>
                    <div ref={rgbSliderRef} className='slider'>
                        <span>Copied !</span>
                        <code>{RGBToCSS([Math.round(rgbColor[0]), Math.round(rgbColor[1]), Math.round(rgbColor[2])])}</code>
                    </div>
                </div>
                <div className="hex-color" onClick={() => handleColorClick(1)}>
                    <div ref={hexSliderRef} className='slider'>
                        <span>Copied !</span>
                        <code>{RGBToHEX(rgbColor)}</code>
                    </div>
                </div>
                <div className="hsl-color" onClick={() => handleColorClick(2)}>
                    <div ref={hslSliderRef} className='slider'>
                        <span>Copied !</span>
                        <code>{HSLToCSS([Math.round(hslColor[0]), Math.round(hslColor[1]), Math.round(hslColor[2])])}</code>
                    </div>
                </div>
            </div>
        </main>
    )
}