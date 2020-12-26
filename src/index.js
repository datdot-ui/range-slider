const bel = require('bel')
const csjs = require('csjs-inject')
const path = require('path')
const filename = path.basename(__filename)

module.exports = rangeSlider
// the number for displaying scale lines
let repeatLine = 1000

function rangeSlider({page, flow, name = 'range-slider', info, range, label, setValue}, protocol) {
    const widget = 'ui-range-slider'
    const { min, max } = range
    const send2Parent = protocol( receive )
    send2Parent({page, from: name, flow: flow ? `${flow}/${widget}` : widget, type: 'init', filename, line: 14})
    let currentValue = setValue > 0 ? setValue : 0
    let input = ui_input(label, currentValue)
    let fill = bel`<div class=${css.fill}></span>`
    let bar = bel`<div class=${css.bar}>${fill}${makeLine(repeatLine)}</div>`
    let sliderRange = ui_range_slider(currentValue)

    if (/cpu/i.test(input.name)) input.value = `${input.value}%`
    if (/ram/i.test(input.name)) input.value = `${input.value} GB`

    input.onclick = handleClick
    input.onfocus = handleFocus
    input.onblur = handleBlur
    input.onkeyup = handleKeyup
    input.onkeydown = handleKeydown
    input.onchange = handleChange
    sliderRange.oninput = handleSliderRangeInput

    const el = bel`
    <div class=${css['range-slider']}>
        <div class=${css.field}>
            ${ui_label()}${input}<span class=${css.info}>${info}</span>
        </div>
        <div class=${css['slider-container']}>
            ${bar}${sliderRange}
        </div>
    </div>`
    return el

    /*************************
    * ------- Layout --------
    *************************/
    // display scale lines
    function makeLine (count) {
        let scale = bel`<div class=${css.scale}></div>`
        for (let i = 0; i < count; i++) {
            let line = bel`<span class='${css.line}'></span>`
            scale.append(line)
        }
        return scale
    }

    function setBar (value) {
        return fill.style.width = `${value}%`
    }

    function ui_label () {
        return bel`<label for=${name} class=${css.label}>${label}</label>`
    }

    function ui_input (label, val) {
        return bel`<input class=${css['field-input']} type='text' aria-live="true" value=${val} aria-label=${label} name=${label}>`
    }

    function ui_range_slider (val) {
        setBar(currentValue)
        return bel`<input class=${css.range} type='range' min=${min} max=${max} step="1" value=${val} aria-label="${name}-range" name="${name}-range" oninput=${(e) => handleChange(e)} onchange=${(e) => handleChange(e)}>`
    }

    /*************************
    * ------- Actions --------
    *************************/
    function handleSliderRangeInput (event) {
        const val = event.target.value
        currentValue = val
        input.value = /cpu/i.test(input.name) ? `${val}%` : `${val} MB`
        setBar(val)
    }

    function handleClick (event) {
        const target = event.target
        target.select()
    }
    
    function handleFocus (event) {
        const target = event.target
        let val = target.value
        console.log('current', currentValue);
        if (/%/.test(val)) return target.value = Number(val.replace('%', ''))
        if (/MB/.test(val)) return target.value = Number(val.replace('MB', ''))
        if (/GB/.test(val)) return target.value = Number(val.replace('GB', ''))
    }

    function handleBlur (event) {
        const target = event.target
        let name = target.name
        console.log('current', currentValue);
        if (/cpu/i.test(name)) target.value = `${currentValue}%`
        if (/ram/i.test(name)) target.value = `${currentValue} GB`
    }

    function handleKeyup (event) {
        const target = event.target
        const val = target.value
        currentValue = Number(val)
        if  ( currentValue > max ) {
            currentValue = Number(max)
            target.value = currentValue
            sliderRange.value = currentValue
            return setBar( currentValue )
        }
        console.log('current', currentValue);
        sliderRange.value = Number(currentValue)
        return setBar( currentValue )
    }

    function handleKeydown (event) {
        const target = event.target
        const val = target.value
        const keyCode = event.keyCode
        currentValue = Number(val)
        
        // number 0-9
        if (keyCode >= 48 && keyCode <= 57) { 
            return
        }
        // increase arrow-up, arrow-right
        if (keyCode === 38 || keyCode === 39) { 
            let increament = currentValue + 1
            currentValue = increament
            target.value = currentValue
            sliderRange.value = increament
            return setBar( increament)
        }
        // decrease arrow-left, arrow-down
        if (keyCode === 37 || keyCode === 40) {
            if (currentValue < 1) return
            let decreament =  currentValue - 1
            currentValue = decreament
            target.value = currentValue
            sliderRange.value = decreament
            return setBar( decreament)
        }
        // delete or backspace
        if (keyCode === 8 ) {
            val.split('').splice(-1, 1)
            return
        }
        return event.preventDefault()
    }

    function handleChange (event) {
        /***
        // todo: make an array list for percentage(%) using 
        ***/
        const target = event.target
       let val = target.value
        sliderRange.value = currentValue
        currentValue = Number(val)
        if (currentValue > max) {
            currentValue = max
            target.value = currentValue
            return 
        }
        console.log('current', currentValue);
        setBar(currentValue)
        send2Parent({page, from: name, flow: widget, type: 'select', body: target.value, filename, line: 27 })
    }
    
    /*************************
    * ------ Receivers -------
    *************************/
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