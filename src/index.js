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
    sliderRange.onkeydown = handleKey
    sliderRange.onchange = handleChange

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

    function handleKey (event) {
        const { target } = event
        if (isIncreaseMultipleTimes(event)) {
            return actionCalculate(target, 9)
        }
        if (isDecreaseMultipleTimes(event)) {
            return actionCalculate(target, -9)
        }
    }

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
        return bel`<input class=${css.range} type='range' min=${min} max=${max} step="1" value=${val} aria-label="${name}-range" name="${name}-range">`
    }

    /*******************************
    * ------- Condicitions --------
    *******************************/
    // Shift(Left/Right) + ArrowUp or Shift(Left/Right) + ArrowRight
    function isIncrease (event) {
        if (event.keyCode === 38 || event.keyCode === 39) return true
    }
    // Shift(Left/Right) + ArrowLeft or Shift(Left/Right) + ArrowDown
    function isDecrease (event) {
        if (event.keyCode === 37 || event.keyCode === 40) return true
    }
    function isIncreaseMultipleTimes (event) {
        if ((event.keyCode === 38 || event.keyCode === 39) && event.shiftKey) return true
    }
    // Shift(Left/Right) + ArrowLeft or Shift(Left/Right) + ArrowDown
    function isDecreaseMultipleTimes (event) {
        if ((event.keyCode === 37 || event.keyCode === 40) && event.shiftKey) return true
    }
    // Number 0-9
    function isNumberKey ({keyCode}) {
        if (keyCode >= 48 && keyCode <= 57) return true
    }
    // Enter
    function isEnterKey ({keyCode}) {
        if (keyCode === 13) return true
    }
    // backspace/delete
    function isDelete ({keyCode}) {
        if (keyCode === 8) return true
    }
    // tab
    function isTab ({keyCode}) {
        if (keyCode === 9) return true
    }
    /*************************
    * ------- Actions --------
    *************************/
    function actionCalculate (target, number) {
        let total = currentValue + number
        currentValue = total
        if (currentValue > max) currentValue = max
        if (currentValue < min) currentValue = min
        input.value = currentValue
        sliderRange.value = currentValue
        setBar( currentValue )
        return
    }

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
        console.log('current', currentValue);
        if (/%/.test(target.value)) return target.value = Number(target.value.replace('%', ''))
        if (/MB/.test(target.value)) return target.value = Number(target.value.replace('MB', ''))
        if (/GB/.test(target.value)) return target.value = Number(target.value.replace('GB', ''))
    }

    function handleBlur (event) {
        const target = event.target
        let name = target.name
        console.log('current', currentValue);
        if (/cpu/i.test(name)) target.value = `${currentValue}%`
        if (/ram/i.test(name)) target.value = `${currentValue} MB`
    }

    function handleKeyup (event) {
        const target = event.target
        const val = target.value
        currentValue = Number(val)
        if  ( currentValue >= max ) {
            currentValue = max
            target.value = currentValue
            sliderRange.value = currentValue
            return setBar( currentValue )
        }
        console.log('current', currentValue);
        sliderRange.value = Number(currentValue)
        setBar( currentValue )
        return 
    }

    function handleKeydown (event) {
        const target = event.target
        const val = target.value
        const keyCode = event.keyCode
        currentValue = Number(val)
        let body = name === 'cpu' ? `${currentValue}%` : `${currentValue} GB`
        send2Parent({from: `${event.code}(${keyCode})`, flow: 'keyboard', type: 'pressed', filename, line: 184 });
        // number 0-9
        if (isNumberKey(event)) return
        // enter
        if (isEnterKey(event))  { 
            target.blur()
            return send2Parent({from: name, flow: widget, type: 'changed', body, filename, line: 190 });
        }
        // increase by Shift + ArrowUp or Shift + ArrowRight
        if (isIncreaseMultipleTimes(event)) return actionCalculate(target, 10)
        // decrease by Shift + ArrowLeft or Shift + ArrowDown
        if (isDecreaseMultipleTimes(event)) return actionCalculate(target, -10)
        // increase by ArrowUp or ArrowRight
        if (isIncrease(event)) return actionCalculate(target, 1)
        // decrease by ArrowLeft or ArrowDown
        if (isDecrease(event)) return actionCalculate(target, -1)
        // delete or backspace
        if (isDelete(event)) return val.split('').splice(-1, 1)
        // tab
        if (isTab(event)) return
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
            return setBar(currentValue)
        }
        console.log('current', currentValue);
        setBar(currentValue)
        let body = name === 'cpu' ? `${currentValue}%` : `${currentValue} MB`
        return send2Parent({page, from: name, flow: widget, type: 'changed', body, filename, line: 223 })
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
    width: 100px;
    border-radius: 4px;
    border: 1px solid #BBBBBB;
    padding: 10px;
    text-align: center;
    font-size: 14px;
    outline: none;
}
.field-input:focus {
    border-color: rgba(94, 176, 245, 1);
}
.field-input::selection {
    background-color: rgba(188, 224, 253, 1);
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
    background-color: rgba(221, 221, 221, 1);
    border-radius: 50px;
    overflow: hidden;
}
.fill {
    display: block;
    width: 0;
    height: 100%;
    background-color: #AAA;
    border-radius: 50px;
    transition: background-color 0.3s ease-in-out;
}
.slider-container:focus-within .bar .fill {
    background-color: #5EB0F5;
}
.slider-container:focus-within .bar .fill:hover {
    background-color: #5EB0F5
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
.range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #EAEAEA;
    outline: none;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(0, 0, 0, .4);
    transition: background-color .3s, box-shadow .15s linear;
}
.range::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 14px rgba(0, 0, 0, .25);
}
.range::-webkit-slider-thumb:active {
    box-shadow: 0 0 0 14px rgba(94, 176, 245, .8);
}
.range::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #EAEAEA;
    outline: none;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(0, 0, 0, .4);
    transition: background-color .3s, box-shadow .15s linear;
}
.range::-moz-range-thumb:hover {
    box-shadow: 0 0 0 14px rgba(0, 0, 0, .25);
}
.range::-moz-range-thumb:active {
    box-shadow: 0 0 0 14px rgba(94, 176, 245, .8);
}
.range::-ms-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #fff;
    border: 1px solid #EAEAEA;
    outline: none;
    cursor: pointer;
    box-shadow: 0 6px 12px rgba(0, 0, 0, .25);
    transition: background-color .3s, box-shadow .3s linear;
}
.range::-ms-thumb:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, .25);
}
.range::-ms-thumb:active {
    box-shadow: 0 0 0 1px rgba(170, 170, 170,.8);
}
`