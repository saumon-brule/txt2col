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
    return `#${Math.round(r).toString(16)}${Math.round(g).toString(16)}${Math.round(b).toString(16)}`.toUpperCase()
}


const placeholderStart = "Enter "
const placeholderEnd = " here"
const placeholders = [
    "something",
    "your name",
    "your pet name",
    "Sadam Hussein",
    "xX_4 w3!rd p53ud0nym3_Xx",
    "whatever you would like to know its associated color",
    "random things",
]

export default function App() {
    const [text, setText] = useState("");
    const [placeholder, setPlaceholder] = useState("text");
    const wordTimeoutIdRef = useRef(undefined);
    const letterIntervalIdsRef = useRef(undefined);
    const placeholderMirror = useRef(placeholder)
    const hslColor = textToHSL(text ? text : placeholderStart + placeholder + placeholderEnd);
    const rgbColor = HSLToRGB(hslColor)

    useEffect(() => {
        document.body.style.backgroundColor = HSLToCSS(hslColor)
    }, [text, placeholder])

    useEffect(() => {
        placeholderMirror.current = placeholder
    }, [placeholder])

    useEffect(() => {
        if (text === "") {
            if (!wordTimeoutIdRef.current && !letterIntervalIdsRef.current) {
                const wordInterval = 1000 + (Math.random() * 2000)
                const letterEraseInterval = 50 + (Math.random() * 100)
                const letterWriteInterval = 50 + (Math.random() * 50)
                const choosenPlaceholder = placeholders[parseInt(Math.random() * placeholders.length)]
                wordTimeoutIdRef.current = setTimeout(() => {
                    letterIntervalIdsRef.current = setInterval(() => {
                        if (placeholderMirror.current == "") {
                            clearInterval(letterIntervalIdsRef.current)
                            letterIntervalIdsRef.current = setInterval(() => {
                                if (placeholderMirror.current.length === choosenPlaceholder.length - 1) {
                                    clearInterval(letterIntervalIdsRef.current)
                                    letterIntervalIdsRef.current = undefined
                                    wordTimeoutIdRef.current = undefined
                                    setPlaceholder(choosenPlaceholder.slice(0, placeholderMirror.current.length + 1))
                                } else {
                                    setPlaceholder(choosenPlaceholder.slice(0, placeholderMirror.current.length + 1))
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

    return (
        <main>
            <div className="main-box">
                <h1>Awesome Text to HSL Converter</h1>
                <input type="text" placeholder={placeholderStart + placeholder + placeholderEnd} onChange={(e) => { setText(e.target.value) }} />
            </div>
            <div className="color-container">
                <div className="rgb-color">
                    <code>{RGBToCSS([Math.round(rgbColor[0]), Math.round(rgbColor[1]), Math.round(rgbColor[2])])}</code>
                </div>
                <div className="hex-color">
                    <code>{RGBToHEX(rgbColor)}</code>
                </div>
                <div className="hsl-color">
                    <code>{HSLToCSS([Math.round(hslColor[0]), Math.round(hslColor[1]), Math.round(hslColor[2])])}</code>
                </div>
            </div>
        </main>
    )
}