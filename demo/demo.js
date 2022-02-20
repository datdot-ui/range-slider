const bel = require('bel')
const csjs = require('csjs-inject')
const rangeSlider = require('..')
const path = require('path')
const filename = path.basename(__filename)
const { getcpu, getram, getbandwidth } = require('../src/node_modules/getSystemInfo')
const domlog = require('ui-domlog')
const message_maker = require('message-maker')

var id = 0

function demo() {
// --------------------------------------------------------
    const myaddress = `${__filename}-${id++}`
    const inbox = {}
    const outbox = {}
    const recipients = {}
    const names = {}
    const message_id = to => (outbox[to] = 1 + (outbox[to]||0))

    function make_protocol (name) {
        return function protocol (address, notify) {
            names[address] = recipients[name] = { name, address, notify, make: message_maker(myaddress) }
            return { notify: listen, address: myaddress }
        }
    }
    function listen (msg) {
        console.log('New message', { msg })
        const { head, refs, type, data, meta } = msg // receive msg
        inbox[head.join('/')] = msg                  // store msg
        const [from] = head
        // send back ack
        const { notify, make, address } = names[from]
        notify(make({ to: address, type: 'ack', refs: { 'cause': head } }))
        appendLog(msg)
    }

    // keep the scroll on bottom when the log displayed on the terminal
    function appendLog (message) { 
        makeLog(message)
        .then( log => {
            terminal.append(log)
            terminal.scrollTop = terminal.scrollHeight
        }
    )}

    async function makeLog (message) {
        return await new Promise( (resolve, reject) => {
            if (message === undefined) reject('no message import')
            const log = domlog(message)
            return resolve(log)
        }).catch( err => { throw new Error(err) } )
    }
// --------------------------------------------------------
    const cpu = rangeSlider({page: 'JOBS', name: 'cpu', label: 'CPU', info: getcpu(), range: { min:0, max: 100 }}, make_protocol('cpu') )
    const ram = rangeSlider({page: 'JOBS', name: 'ram', label: 'RAM', info: getram(), range: { min:0, max: 8 }, setValue: 1}, make_protocol('ram') )
    const bandwidth = getbandwidth()
    const download = rangeSlider({page: 'JOBS', name: 'download', label: 'Download', info: bandwidth.download, range: { min:0, max: 20}, setValue: 8}, make_protocol('download') )
    const upload = rangeSlider({page: 'JOBS', name: 'upload', label: 'Upload', info: bandwidth.upload, range: { min:0, max: 5 }, setValue: 1}, make_protocol('upload') )
    
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

document.body.append(demo())