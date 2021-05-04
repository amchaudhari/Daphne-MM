// This script includes design components for feature space exploration. Particularly, On the right pancel, sliders represent features.
// On the left panel, there is a design visualization panel. 
// By changing slider values, one can change the feature values of the design shown on the left panel. 
// New feature values are added to the features of the existing design. The new generated design with the changed features is shown on the left panel.

{
	let featCreat_data = [];
	let step_values = Array.apply(null, Array(num_ticks)).map(function (x, i) { return (-2.5+i*0.5); })

	var inticks = [];
	for (let i = 0; i < num_ticks; i++) {
		var value = step_values[i]
		inticks.push({ 
			value: value,
			label: value,
			name: '',
			method: 'relayout', 
			args: []
		});
	}

	// Check for formatting https://plotly.com/javascript/reference/layout/sliders/
	const slider_template = {
		pad: {l:300, r: -500},
		len: 0.25,
		steps: inticks,
		active: 5,
		x:0.65,
		y:1,
		xref: 'paper',
		xanchor: 'left',
      	yref: 'paper',
      	yanchor: 'top',
		transition:{
			duration:50,
			easing: 'linear'
		},
		currentvalue: {
			font: {color: 'black'},
			suffix: '                                                                     ',
			xanchor: "right",
			offset: -15
		},
		tickcolor: 'white',
		font: {
			color: 'white'
		},
	}

	var design = {
		z: [],
		type: 'heatmap',
		hoverinfo:'skip',
		colorscale:'Greys',
		showscale: false,
		ticks:""
	};

	const annotation_template = {
		x: 1.20,
		y: 1,
		text: '',
		showarrow: false,
		xref: 'paper',
		xanchor: 'left',
      	yref: 'paper',
      	yanchor: 'top',
      	align:"right"
	}

	var featCreat_layout = {
		width: 938,
		autoszie: true,
		xaxis: {
			ticks:"",
			showticklabels:false,
			showgrid: false
		},
		yaxis: {
			ticks:"",
			showticklabels:false,
			showgrid: false
		},
		margin: {
			t: 25,
			r: 530,
			pad: 10
		},
		annotations: [],
		sliders: []
	};

	config = {
		displayModeBar: false,
		staticPlot: true,
		displaylogo: false
	};

	Plotly.newPlot(featCreat, [design], update_layouts(featCreat_layout), config);

	function update_layouts(_layout){
		// Add axis properties
		// for (let i = 0; i < num_features; i++) {
		// 	for (let j = 0; j < num_ticks; j++){
		// 		let id = i*num_ticks+j+1;
		// 		if (id === 1){
		// 			id=''
		// 		}
		// 		if (j === Math.floor(num_ticks/2)) { // Keep the middle value active initially
		// 			eval("_layout.xaxis"+ id + "={ticks:'', showticklabels:false, showgrid: false, mirror: true, linewidth: 3, linecolor:'red'};");
		// 			eval("_layout.yaxis"+ id + "={ticks:'', showticklabels:false, showgrid: false, mirror: true, linewidth: 3, linecolor:'red'};");
		// 		} else {
		// 			eval("_layout.xaxis"+ id + "={ticks:'', showticklabels:false, showgrid: false, mirror: true, linewidth: 3, linecolor:'white'};");
		// 			eval("_layout.yaxis"+ id + "={ticks:'', showticklabels:false, showgrid: false, mirror: true, linewidth: 3, linecolor:'white'};");
		// 		}
				
		// 	}
		// }

		// Add sliders
		for (let i = 0; i < num_features; i++) {
			slider = deepCopyFunction(slider_template);
			slider.y = Number((1-i/num_features).toFixed(2));
			//Create update upon slider event
			var slider_update = {};
			// Add the update to sliders
			// for (let j = 0; j < num_ticks; j++) {
			// 	update = deepCopyFunction(slider_update)
			// 	let id = i*num_ticks+j+1;
			// 	if (id === 1){
			// 		id=''
			// 	}
			// 	update['xaxis'+id+'.linecolor']='red';
			// 	update['yaxis'+id+'.linecolor']='red';
			// 	slider.steps[j].args = [update]
			// }
			_layout.sliders.push(slider);
		}

		// Add feature annotations
		for (let i = 0; i < num_features; i++) {
			annotation = deepCopyFunction(annotation_template)
			annotation.y = Number((1-i/num_features-0.09).toFixed(2));
			annotation.text = feature_names[i]+':'
			_layout.annotations.push(annotation);
		}

		// Add text on slider scale
		low_annot = deepCopyFunction(annotation_template)
		low_annot.x = 1.55; low_annot.y = 1.05;
		low_annot.text = '<em>Low</em>'
		_layout.annotations.push(low_annot);

		mid_annot = deepCopyFunction(annotation_template)
		mid_annot.x = 1.95; mid_annot.y = 1.05;
		mid_annot.text = '<em>Mid</em>'
		_layout.annotations.push(mid_annot);

		high_annot = deepCopyFunction(annotation_template)
		high_annot.x = 2.30; high_annot.y = 1.05;
		high_annot.text = '<em>High</em>'
		_layout.annotations.push(high_annot);

		return _layout
	};

	// function update_data(_data){
	// 	// Add subplot data
	// 	for (let i = 0; i < num_features; i++) {
	// 		for (let j = 0; j < num_ticks; j++){
	// 			let id = i*num_ticks+j+1;
	// 			image = JSON.parse(feature_images.slice(i, (i + 1)).map( function (x, _) { return x.slice(j, (j + 1)) } ))
	// 			image = image.map( x => subtract_arr_from_1(x) )
	// 			let design = {
	// 				z: image,
	// 				type: 'heatmap',
	// 				hoverinfo:'skip',
	// 				colorscale:'Greys',
	// 				showscale: false,
	// 				xaxis: 'x'+id,
	// 				yaxis: 'y'+id,
	// 			};
	// 			_data[id-1] = design
	// 		}
	// 	}
	// 	return _data
	// }

	// LIsten to generate design & test button
	document.getElementById("testDesign").addEventListener("click", onclickGenerateDesign, false);
	function onclickGenerateDesign(){
		let sliders = document.getElementsByClassName("slider-group");
		z = [];
		for (let i = 0; i < sliders.length; i++) {
			z.push(step_values[sliders[i].__data__.active])
		}
		send_data = {
			'x': '',
			'z': z,
			'points_checked': points_checked,
		}
		liveSend(send_data)
	}

	//;isten to reset all button
	document.getElementById("resetAll").addEventListener("click", onclickReset, false);
	function onclickReset(){
		let update = {}
		for (let i = 0; i < num_features; i++) {
			update['sliders['+i+'].active'] = Math.floor(num_ticks/2)
			for (let j = 0; j < num_ticks; j++) {
				let id = i*num_ticks+j+1;
				if (id === 1){
					id=''
				}
				if (j === Math.floor(num_ticks/2)) { // Keep the middle value active initially
					update["xaxis"+ id] ={ticks:'', showticklabels:false, showgrid: false, mirror: true, linewidth: 3, linecolor:'red'};
					update["yaxis"+ id] ={ticks:'', showticklabels:false, showgrid: false, mirror: true, linewidth: 3, linecolor:'red'};
				} else {
					update["xaxis"+ id] ={ticks:'', showticklabels:false, showgrid: false, mirror: true, linewidth: 3, linecolor:'white'};
					update["yaxis"+ id] ={ticks:'', showticklabels:false, showgrid: false, mirror: true, linewidth: 3, linecolor:'white'};
				}
			}
		}
		Plotly.relayout(featCreat, update)
	}
}