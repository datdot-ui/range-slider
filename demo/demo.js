const bel = require('bel')
const csjs = require('csjs-inject')
const rangeSlider = require('..')
const path = require('path')
const filename = path.basename(__filename)
const { getcpu, getram, getbandwidth } = require('../src/node_modules/getSystemInfo')
const domlog = require('ui-domlog')

function demoComponent() {
    let recipients = []
    const cpu = rangeSlider({page: 'JOBS', name: 'cpu', label: 'CPU', info: getcpu(), range: { min:0, max: 100 }}, protocol('cpu') )
    const ram = rangeSlider({page: 'JOBS', name: 'ram', label: 'RAM', info: getram(), range: { min:0, max: 8 }, setValue: 1}, protocol('ram') )
    const bandwidth = getbandwidth()
    const download = rangeSlider({page: 'JOBS', name: 'download', label: 'Download', info: bandwidth.download, range: { min:0, max: 20}, setValue: 8}, protocol('download') )
    const upload = rangeSlider({page: 'JOBS', name: 'upload', label: 'Upload', info: bandwidth.upload, range: { min:0, max: 5 }, setValue: 1}, protocol('upload') )
    
    const content = bel`
    <div class=${css.content}>
        ${cpu}
        ${ram}
        ${download}
        ${upload}
    </div>
    `
    // show logs
    let terminal = bel`<div class=${css.terminal}></div>`
    // container
    const container = wrap(content, terminal)

    document.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', () => {
            [...content.children].map( item => {
                item.addEventListener('touchend', () => {
                    item.blur()
                })
            })
        })
    })
    return container

    function wrap (content) {
        const container = bel`
        <div class=${css.wrap}>
            <section class=${css.container}>
                ${content}
            </section>
            ${terminal}
        </div>
        `
        return container
    }

    /*************************
    * ------- Actions --------
    *************************/

    /*************************
    * ------- Protocol --------
    *************************/
    function protocol (name) {
        return send => {
            recipients[name] = send
            return receive
        }
    }

    /*************************
    * ------ Receivers -------
    *************************/
    function receive (message) {
        const { page, from, flow, type, action, body, line } = message
        showLog({page, from, flow, type, body, filename, line: 61})
    }

    // keep the scroll on bottom when the log displayed on the terminal
    function showLog (message) { 
        sendMessage(message)
        .then( log => {
            terminal.append(log)
            terminal.scrollTop = terminal.scrollHeight
        }
    )}
   /*********************************
    * ------ Promise() Element -------
    *********************************/
    async function sendMessage (message) {
        return await new Promise( (resolve, reject) => {
            if (message === undefined) reject('no message import')
            const log = domlog(message)
            return resolve(log)
        }).catch( err => { throw new Error(err) } )
    }
}

const css = csjs`
*, *:before, *:after {
    box-sizing: inherit;
}
html {
    box-sizing: border-box;
    height: 100%;
}
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
    grid-template-rows: 75% 25%;
    height: 100%;
}
.container {
    padding: 25px;
}
.content {
    margin-bottom: 25px;
}
.terminal {
    background-color: #212121;
    color: #f2f2f2;
    font-size: 13px;
    overflow-y: auto;
}
`

document.body.append( demoComponent() )