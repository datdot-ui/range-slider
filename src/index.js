const bel = require('bel')
const csjs = require('csjs-inject')
const path = require('path')
const filename = path.basename(__filename)

module.exports = rangeSlider
let repeatLine = 1000

function rangeSlider({page, name = 'range-slider', info, range, label}, protocol) {
    const widget = 'ui-range-slider'
    const { min, max } = range
    const send2Parent = protocol( receive )
    send2Parent({page, from: name, flow: widget, type: 'init', filename, line: 11})
    let input = ui_input(label)
    let fill = bel`<div class=${css.fill}></span>`

    let bar = bel`<div class=${css.bar}>${fill}${makeLine(repeatLine)}</div>`
    let sliderRange = ui_range_selector_input()

    

    const el = bel`
    <div class=${css['range-slider']}>
        <div class=${css.field}>
            ${ui_label()}
            ${input}
            <span class=${css.info}>${info}</span>
        </div>
        <div class=${css['slider-container']}>
            ${bar}
            ${sliderRange}
        </div>
    </div>`
    return el
    
    function makeLine (count) {
        let scale = bel`<div class=${css.scale}></div>`
        for (let i = 0; i < count; i++) {
            let line = bel`<span class='${css.line}'></span>`
            scale.append(line)
        }
        return scale
    }

    function setBar (value) {
        fill.style.width = `${value}%`
    }

    function handleOnChange (target) {
        /***
        // todo: make an array list for percentage(%) using 
        ***/
       let text
       let val = target.value
        sliderRange.value = val
        setBar(val)

        name === 'cpu' ?  text = `${val}%`  : text = `${val} MB` 
        input.value = text

        send2Parent({page, from: name, flow: widget, type: 'select', body: text, filename, line: 27 })
    }

    function ui_label () {
        return bel`<label for=${name} class=${css.label}>${label}</label>`
    }

    function ui_input () {
        return bel`<input class=${css['field-input']} type='text' aria-live="true" aria-label=${name} name=${name} onchange=${e => handleOnChange(e.target) } onkeydown=${e => handleOnKey(e.target)}  onkeyup=${e => handleOnKey(e.target)}  onkeypress=${e => handleOnKey(e.target)}>`
    }

    function ui_range_selector_input (val = 0) {
        return bel`<input class=${css.range} type='range' min=${min} max=${max} step="1" value=${val} aria-label="${name}-range" name="${name}-range" oninput=${(e) => handleOnChange(e.target)} onchange=${(e) => handleOnChange(e.target)}>`
    }

    function handleOnKey (target) {
        let val = target.value
        if (val.length  > 3) return val = ''
        if ( isNaN(val) ) return val = '' 
        else return val
    }

    function receive(message) {
        const { page, from, flow, type, action, body } = message
        // console.log('received from main component', message )
    }
}

const css = csjs`
.range-slider {
    display: grid;
}
.field {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto 1fr auto;
    align-items: center;
}
.label {
    margin-right: 12px;
    color: #707070;
}
.field-input {
    width: 55px;
    border-radius: 4px;
    border: 1px solid #BBBBBB;
    padding: 10px;
    text-align: center;
    font-size: 14px;
}
.info {
    color: #707070;
}
.slider-container {
    position: relative;
}
.bar {
    position: absolute;
    z-index: 1;
    left: 3px;
    top: 12px;
    width: 100%;
    height: 10px;
    background-color: rgba(221,221,221, 1);
    border-radius: 50px;
    overflow: hidden;
}
.fill {
    display: block;
    width: 0;
    height: 100%;
    background-color: #AAA;
    border-radius: 50px;
}
.scale {
    position: absolute;
    top: 2px;
    left: 0;
    z-index: -1;
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: repeat(${repeatLine}, 20px);
}
.line {
    display: block;
    width: 2px;
    height: 6px;
    background-color: #fff;
}
.range { 
    position: relative;
    z-index: 2;
    -webkit-appearance: none;
    background-color: transparent;
    width: 100%;
    height: 30px;
    outline: none;
}
.range::-webkit-slider-thumb{
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #EAEAEA;
    outline: none;
    cursor: pointer;
    box-shadow: 0 0 0 1px rgba(0,0,0,.1);
    transition: box-shadow .3s ease-in-out;
}
.range::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 4px rgba(0,0,0,.2);
}
.range::-webkit-slider-thumb:active {
    box-shadow: 0 0 0 8px rgba(170,170,170,.8);
}
.range::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #EAEAEA;
    outline: none;
    cursor: pointer;
    box-shadow: 0 0 0 1px rgba(0,0,0,.1);
    transition: box-shadow .3s ease-in-out;
}
.range::-moz-range-thumb:hover {
    box-shadow: 0 0 0 10px rgba(0,0,0,.2);
}
.range::-moz-slider-thumb:active {
    box-shadow: 0 0 0 24px rgba(170,170,170,.8);
}
.range::-ms-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #EAEAEA;
    outline: none;
    cursor: pointer;
    box-shadow: 0 0 0 1px rgba(0,0,0,.1);
    transition: box-shadow .3s ease-in-out;
}
.range::-ms-thumb:hover {
    box-shadow: 0 0 0 1px rgba(0,0,0,.2);
}
.range::-ms-thumb:active {
    box-shadow: 0 0 0 1px rgba(170,170,170,.8);
}
`