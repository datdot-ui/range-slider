const bel = require('bel')
const csjs = require('csjs-inject')
const path = require('path')
const filename = path.basename(__filename)

module.exports = rangeSlider

function rangeSlider({page, flow, name = 'range-slider', info, range, label, setValue}, protocol) {
    const widget = 'ui-range-slider'
    const { min, max } = range
    const send2Parent = protocol( receive )
    send2Parent({page, from: name, flow: flow ? `${flow}/${widget}` : widget, type: 'init', filename, line: 12})
    let currentValue = setValue > 0 ? setValue : 0
    let input = ui_input(label, currentValue)
    let fill = bel`<div class=${css.fill}></span>`
    let repeatLine = 1000
    let line = makeLine(repeatLine)
    let bar = bel`<div class=${css.bar}>${fill}${line}</div>`
    let sliderRange = ui_range_slider(currentValue)

    line.style.gridTemplateColumns = `repeat(${repeatLine}, 20px)`

    input.onclick = handleClick
    input.onkeyup = handleKeyup
    input.onkeydown = handleKeydown
    input.onkeypress = handleKeypress
    input.onchange = handleChange
    sliderRange.oninput = handleSliderRangeInput
    sliderRange.onkeydown = handleKey
    sliderRange.onchange = handleChange

    const el = bel`
    <div class=${css['range-slider']}>
        <div class=${css.field}>
            ${ui_label()}
            <div class=${css['input-form']}>
                ${input}
                <span class=${css.unit}>${name === 'cpu' ? ' %' : name === 'ram' ? ' GB' : ' MB'}</span>
            </div>
            <span class=${css.info}>${info}</span>
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
    // convert width to percentage
    function setBar (value) {
        return fill.style.width = `${(value/max)*100}%`
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
     // select all
     function isSelectAll({keyCode}) {
        if (keyCode === 91 && keyCode === 65) return true
    }
    // ArrowRight or ArrowUp
    function isIncrease ({keyCode}) {
        if (keyCode === 38 || keyCode === 39) return true
    }
    // ArrowLeft or ArrowDown
    function isDecrease ({keyCode}) {
        if (keyCode === 37 || keyCode === 40) return true
    }
    // Shift(Left/Right) + ArrowUp or Shift(Left/Right) + ArrowRight
    function isIncreaseMultipleTimes ({keyCode, shiftKey}) {
        if ((keyCode === 38 || keyCode === 39) && shiftKey) return true
    }
    // Shift(Left/Right) + ArrowLeft or Shift(Left/Right) + ArrowDown
    function isDecreaseMultipleTimes ({keyCode, shiftKey}) {
        if ((keyCode === 37 || keyCode === 40) && shiftKey) return true
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
        return send2Parent({from: name, flow: widget, type: 'changed', body: currentValue, filename, line: 128 })
    }

    function handleSliderRangeInput (event) {
        const target = event.target
        const val = Number(target.value)
        currentValue = val
        input.value = val
        setBar(val)
    }

    function handleClick (event) {
        const target = event.target
        target.select()
    }
    
    function handleKeypress (event) {
        const target = event.target
        const keyCode = event.keyCode
        if (currentValue >= max && keyCode >= 48 && keyCode <= 57 || currentValue === 0 && keyCode === 48) return event.preventDefault()
    }

    function handleKey (event) {
        const { target } = event
        if (isIncreaseMultipleTimes(event)) {
            console.log('increase');
            return actionCalculate(target, 9)
        }
        if (isDecreaseMultipleTimes(event)) {
            console.log( 'Decrease');
            return actionCalculate(target, -9)
        }
    }

    function handleKeyup (event) {
        const target = event.target
        const val = Number(target.value)
        currentValue = val
        if  ( currentValue >= max ) currentValue = max
        if  ( currentValue <= min ) currentValue = min
        target.value = currentValue
        sliderRange.value = currentValue
        setBar( currentValue )
        return 
    }

    function handleKeydown (event) {
        const target = event.target
        const val = Number(target.value)
        const keyCode = event.keyCode
        currentValue = val
        send2Parent({from: `${event.code}(${keyCode})`, flow: 'keyboard', type: 'pressed', filename, line: 179 })
        
        // number 0-9
        if (isNumberKey(event)) return
        // enter
        if (isEnterKey(event))  { 
            target.blur()
            return send2Parent({from: name, flow: widget, type: 'changed', body: currentValue, filename, line: 186 })
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
        if (isDelete(event)) return target.value.split('').splice(-1, 1)
        // tab
        if (isTab(event)) return

        return event.preventDefault()
    }

    function handleChange (event) {
        /***
        // todo: make an array list for percentage(%) using 
        ***/
        const target = event.target
        let val = Number(target.value)
        currentValue = val
        sliderRange.value = currentValue
        setBar(currentValue)
        return send2Parent({page, from: name, flow: widget, type: 'changed', body: currentValue, filename, line: 213 })
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
    width: 100%;
    border: 1px solid rgba(187, 187, 187, 1);
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
    outline: none;
}
.field-input:focus-within {
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
.range::-webkit-slider-thumb:active, .range::-webkit-slider-thumb:focus {
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
.range::-moz-range-thumb:active, .range::-moz-range-thumb:focus {
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
.range::-ms-thumb:active, .range::-ms-thumb:focus {
    box-shadow: 0 0 0 1px rgba(170, 170, 170,.8);
}
.input-form {
    display: grid;
    grid-template-rows: 1fr;
    grid-template-columns: 80px auto;
    justify-content: left;
    align-items: center;
    grid-gap: 5px;
}
.unit {}
`