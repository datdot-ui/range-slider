const bel = require('bel')
const csjs = require('csjs-inject')
const path = require('path')
const filename = path.basename(__filename)

module.exports = rangeSlider

function rangeSlider({page, name = 'range-slider', info, range, label}, protocol) {
    const widget = 'ui-range-slider'
    const { min, max } = range
    const send2Parent = protocol( receive )
    send2Parent({page, from: name, flow: widget, type: 'init', filename, line: 11})
    let input = ui_input(label)
    let fill = bel`<span class=${css.fill}></span>`
    let bar = bel`<span class=${css.bar}>${fill}</span>`
    
    const el = bel`
    <div class=${css['range-slider']}>
        <div class=${css.field}>
            ${ui_label()}
            ${input}
            <span class=${css.info}>${info}</span>
        </div>
        <div class=${css['slider-container']}>
            ${bar}
            ${ui_range_selector_input()}
        </div>
    </div>`
    return el

    function setBar (value) {
        fill.style.width = `${value}%`
    }

    function handleOnChange (target) {
        /***
        // todo: make an array list for percentage(%) using 
        ***/
        setBar(target.value)
        if ( name === 'cpu') { var value = `${target.value}%` } 
        else { var value = `${target.value} MB` }
        input.value = value
        
        send2Parent({page, from: name, flow: widget, type: 'select', body: value, filename, line: 27 })
    }

    function ui_label () {
        return bel`<label for=${name} class=${css.label}>${label}</label>`
    }

    function ui_input () {
        return bel`<input class=${css['field-input']} type='text' aria-live="true" aria-label=${name} name=${name} onkeydown=${e => handleOnKey(e.target)}  onkeyup=${e => handleOnKey(e.target)}  onkeypress=${e => handleOnKey(e.target)}>`
    }
    function ui_range_selector_input () {
        return bel`<input class=${css.range} type='range' min=${min} max=${max} step="1" value="0" aria-label="${name}-range" name="${name}-range" oninput=${(e) => handleOnChange(e.target)} onchange=${(e) => handleOnChange(e.target)}>`
    }

    function handleOnKey (target) {
        const value = target.value
        if ( isNaN( value ) ) return target.value = ''
        else return target.value = value
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
    top: 3px;
    width: 100%;
    height: 10px;
    background-color: rgba(221,221,221, 1);
}
.fill {
    display: block;
    width: 0;
    height: 100%;
    background-color: #AAA;
}
.range { 
    position: relative;
    z-index: 2;
    -webkit-appearance: none;
    background-color: transparent;
    width: 100%;
    height: 10px;
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
    box-shadow: 0 0 0 8px rgba(0,0,0,.2);
}
.range:active::-webkit-slider-thumb {
    box-shadow: 0 0 0 12px rgba(0,0,0,.4);
}
`