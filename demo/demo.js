const bel = require('bel')
const csjs = require('csjs-inject')
const range_slider = require('..')
const { getcpu, getram, getbandwidth } = require('../src/node_modules/getSystemInfo')
const protocol_maker = require('protocol-maker')

var id = 0



function imaginary_parent_of_demo () {
    const followups = {}
    const contacts = protocol_maker('demo-parent', message => {
        console.log('ROOT', message)
    })
    const wire = contacts.add('demo')
    document.body.append(demo(wire))


    // // set theme for all range slider components
    // const { notify, make, address } = contacts.by_name['demo']
    // const help_msg = make({ to: address, type: 'help' })
    // const head = help_msg.head.toString()
    // followups[head] = (state) => {
    //     const { opts: { theme }, contacts: contacts } = state
    //     debugger
    //     // const { make, address, notify } = contacts['input-0']
    //     // notify(make({ to: address, type: 'theme', data: { theme: custom_theme }}))
    // }
    // notify(help_msg)
    
}






function demo (parent_wire) {
// --------------------------------------------------------
    const initial_contacts = { 'parent': parent_wire }
    const contacts = protocol_maker('demo', listen, initial_contacts)
    function listen (msg) {
        console.log('New message', { msg })
        const { head, refs, type, data, meta } = msg // receive msg
        const [from] = head
        if (type === 'help' && followups[refs.cause.toString()]) {
            const cb = followups[refs.cause]
            const { state } = data
            cb(data.state)
        }
    }
// --------------------------------------------------------
    const cpu = range_slider({ label: 'CPU', unit: '%', info: getcpu(), range: { min:0, max: 100 } }, contacts.add('cpu') )
    const ram = range_slider({ label: 'RAM', unit: 'GB', info: getram(), range: { min:0, max: 8 }, value: 1 }, contacts.add('ram') )
    const bandwidth = getbandwidth()
    const download = range_slider( {label: 'Download', unit: 'MB', info: bandwidth.download, range: { min:0, max: 20}, value: 8 }, contacts.add('download') )
    const upload = range_slider({ label: 'Upload', unit: 'MB', info: bandwidth.upload, range: { min:0, max: 5 }, value: 1 }, contacts.add('upload') )
    
    const content = bel`
    <div class=${css.content}>
        ${cpu}
        ${ram}
        ${download}
        ${upload}
    </div>
    `
    // container
    const container = wrap(content)

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
imaginary_parent_of_demo()