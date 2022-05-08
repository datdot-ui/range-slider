const bel = require('bel')
const style_sheet = require('support-style-sheet')
const protocol_maker = require('protocol-maker')
const input_number = require('datdot-ui-input-number')

var id = 0
var count = 0
const sheet = new CSSStyleSheet()
const default_opts = {
	info: '',
	range: { min: 0, max: 100 },
	label: '',
	unit: '', 
	value: 0,
	theme: get_theme()
}
sheet.replaceSync(default_opts.theme)

module.exports = range_slider


// help for module
range_slider.help = () => { return { opts: default_opts } }

function range_slider(opts, parent_wire) {
	const { 
		info = default_opts.info, 
		range = default_opts.range, 
		label = default_opts.label, 
		unit = default_opts.unit, 
		value = default_opts.value, 
		theme = `` } = opts
	
	const { min = default_opts.range.min, max = default_opts.range.max } = range

	const current_state =  { opts: { info, range,	label, unit, value, sheets: [default_opts.theme, theme] } }
		
// ---------------------------------------------
	const initial_contacts = { 'parent': parent_wire }
	const contacts = protocol_maker('range-slider', listen, initial_contacts)
	
	function listen (msg) {
			const { head, refs, type, data, meta } = msg // listen to msg
			const [from, to, msg_id] = head
			if (type === 'onchange') update_range_slider(data.value)
			if (type === 'help') {
				const $from = contacts.by_address[from]
				$from.notify($from.make({ to: $from.address, type: 'help', data: { state: get_current_state() }, refs: { cause: head }}))                         
			}
	}

	const $parent = contacts.by_name['parent']
// ---------------------------------------------
	const input_name = `unit-${count++}`
	let input = input_number({ value: current_state.opts.value, min, max, step: 1, 
		theme: { 
			props: {
				"--border-width": "1px",
				"--border-style": "solid",
				"--border-color": "rgba(187, 187, 187, 1)",
				"--pading": "4px 8px",
				"--border-radius": "4px",
				"--size": "0.9rem",
				"--width": "90%"
			},
	} }, contacts.add(input_name))
	
	let fill = document.createElement('span')
	fill.setAttribute('class', 'fill')
	
	let repeatLine = 1000
	let line = make_scale_lines(repeatLine)
	line.style.gridTemplateColumns = `repeat(${repeatLine}, 20px)`
	
	let bar = document.createElement('span')
	bar.setAttribute('class', 'bar')
	bar.append(fill, line)
	setBar(current_state.opts.value)

	const el = document.createElement('i-input')
	const shadow = el.attachShadow({mode: 'closed'})

	function domify (html) {
		const parser = document.createElement('div')
		parser.innerHTML = html
		return parser.children[0]
	}
	
	const sliderRange = domify(`<input class="range" type="range" aria-label="${label} tabindex="0" min="${min}" max="${max}" value="${current_state.opts.value}">`)
	sliderRange.onclick = handleSliderClick
	sliderRange.oninput = handleSliderRangeInput
	sliderRange.onchange = handleChange
	sliderRange.ontouchstart = handleTouchStart
	sliderRange.onwheel = handleWheel
	
	const variable = x => [`<var${x}></var${x}>`, `var${x}`]
	const $sliderRange = variable(1)
	const $input = variable(2)
	const $bar = variable(3)
	
	const slider = domify(`
		<div class="range-slider" aria-label=${label}>
			<div class="field">
				<label for=${label} class="label">${label}</label>
				<div class="input-form"> ${$input[0]} <span class="unit">${unit}</span> </div>
				<span class="info">${info}</span>
			</div>
			<div class="slider-container">
				${$bar[0]}${$sliderRange[0]}
			</div>
		</div>
	`)
	slider.querySelector($bar[1]).replaceWith(bar)
	slider.querySelector($input[1]).replaceWith(input)
	slider.querySelector($sliderRange[1]).replaceWith(sliderRange)

	shadow.append(slider)

	const custom_theme = new CSSStyleSheet()
	custom_theme.replaceSync(theme)
	shadow.adoptedStyleSheets = [sheet, custom_theme]

	return el 

	// layout
	function make_scale_lines (count) {
			let scale = document.createElement('div')
			scale.setAttribute('class', 'scale')
			for (let i = 0; i < count; i++) {
					let line = document.createElement('span')
					line.setAttribute('class', 'line')
					scale.append(line)
			}
			return scale
	}

	function setBar (value) { return fill.style.width = `${(value/max)*100}%` } // convert width to percentage

	// handlers 
	function handleWheel (event) {
		const target = event.target
		const step = 1
		const currentValue = current_state.opts.value
		let mousewheelevt = (/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel"
		if (mousewheelevt === "mousewheel") { event.wheelDelta > 0 ?  update_range_slider(currentValue + step) : update_range_slider(currentValue - step) } 
		else { event.deltaY > 0 ? update_range_slider(currentValue + step) : update_range_slider(currentValue - step)	}
	}

	function handleTouchStart (event) {
		const target = event.target
		target.focus()
	}

	function handleSliderClick (event) { const target = event.target }

	function handleSliderRangeInput (event) {
		const target = event.target
		const val = Number(target.value)
		current_state.opts.value = val
		input.value = val
		setBar(val)
		$parent.notify($parent.make({ to: $parent.address, type: 'changed', data: { value: current_state.opts.value } }))
		const $input = contacts.by_name[input_name]
		$input.notify($input.make({ to: $input.address, type: 'update', data: { value: current_state.opts.value } }))
	}

	function handleChange (event) {
		// todo: make an array list for percentage(%) using 
		current_state.opts.value = Number(event.target.value)
		sliderRange.value = current_state.opts.value
		setBar(current_state.opts.value)
		$parent.notify($parent.make({ to: $parent.address, type: 'changed', data: { currentValue: current_state.opts.value } }))
		const $input = contacts.by_name[input_name]
		$input.notify($input.make({ to: $input.address, type: 'update', data: { value: current_state.opts.value } }))
	}

	//helpers
	function update_range_slider (value) {
		if (value > max) value = max
		if (value < min) value = min
		current_state.opts.value = value
		sliderRange.value = value
		setBar(value)
		$parent.notify($parent.make({ to: $parent.address, type: 'changed', data: { value: current_state.opts.value } }))
		const $input = contacts.by_name[input_name]
		$input.notify($input.make({ to: $input.address, type: 'update', data: { value: current_state.opts.value } }))
	}

	function get_current_state () {
		return  {
			opts: current_state.opts,
			contacts
		}
	}
}

function get_theme () {
	return `
			:host(i-input) {

			}
			.range-slider {
					display: grid;
			}
			.field {
					display: grid;
					grid-template-rows: auto;
					grid-template-columns: auto 1fr auto;
					align-items: center;
			}
			.range-slider:active .label, 
			.range-slider:focus .label, 
			.range-slider:focus-within .label {
					color: rgba(94, 176, 245, 1);
			}
			.label {
					margin-right: 12px;
					color: #707070;
					transition: color .3s linear;
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
			.range-slider:active .bar .fill,
			.range-slider:focus .bar .fill, 
			.range-slider:focus-within .bar .fill {
					background-color: #5EB0F5;
			}
			.range-slider:focus .bar .fill:hover, 
			.range-slider:focus-within .bar .fill:hover {
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
					box-shadow: 0 0 0 14px rgba(94, 176, 245, .8);
			}
			.range::-webkit-slider-thumb:focus,
			.range::-webkit-slider-thumb:focus-within {
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
			.range::-moz-range-thumb:focus,
			.range::-moz-range-thumb:focus-within {
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
			.range::-ms-thumb:focus,
			.range::-ms-thumb:focus-within {
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
} 