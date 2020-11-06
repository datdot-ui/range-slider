const bel = require('bel')
const csjs = require('csjs-inject')
const rangeSlider = require('..')
const path = require('path')
const filename = path.basename(__filename)
const { getcpu, getram } = require('../src/node_modules/getSystemInfo')

let count = 1

function demoComponent() {
    const terminal = bel`<div class=${css.terminal}></div>`
    const cpu = rangeSlider({page: 'JOBS', name: 'cpu', label: 'CPU', info: getcpu(), range: { min:0, max:100 }}, protocol('cpu') )
    const ram = rangeSlider({page: 'JOBS', name: 'ram', label: 'RAM', info: getram(), range: { min:0, max:100 }}, protocol('ram') )
    const element = bel`
    <div class=${css.wrap}>
    <div class=${css.container}>
        ${cpu} ${ram}
    </div>
    ${terminal}
    </div>`
    
    return element

    function protocol (name) {
        return send => {
            send(({page: 'JOBS', flow: 'ui-range-slider', type: 'ready', filename, line: 15}))
            domlog({page: 'JOBS', flow: 'ui-range-slider', type: 'ready', filename, line: 15})
            return receive
        }
    }
    
    function receive (message) {
        const { page, from, flow, type, action, body, filename, line } = message
        domlog(message)
    }
    
    function domlog (message) {
        const { page, from, flow, type, body, action, filename, line } = message
        const log = bel`
        <div class=${css.log} role="log">
            <div class=${css.badge}>${count}</div>
            <div class=${css.output}>${page}/${flow}: ${from} ${type} ${body}</div>
            <div class=${css['code-line']}>${filename}:${line}</div>
        </div>`
        // console.log( message )
        terminal.append(log)
        terminal.scrollTop = terminal.scrollHeight
        count++
    }
}


const css = csjs`
body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    background-color: #F2F2F2;
    height: 100%;
}
.wrap {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 75vh 25vh;
}
.container {
    padding: 25px;
}
.container > div {
    margin-bottom: 25px;
}
.terminal {
    background-color: #212121;
    color: #f2f2f2;
    font-size: 13px;
    overflow-y: auto;
}
.log:last-child {
    color: #FFF500;
    font-weight: bold;
    
}
.log {
    display: grid;
    grid-template-rows: auto;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    padding: 2px 12px 0 0;
    border-bottom: 1px solid #333;
}
.output {

}
.badge {
    background-color: #333;
    padding: 6px;
    margin-right: 10px;
    font-size: 14px;
    display: inline-block;
}
.code-line {

}
`

document.body.append( demoComponent() )