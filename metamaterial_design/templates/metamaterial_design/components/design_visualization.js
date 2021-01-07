{
	var design = {
		z: image,
		type: 'heatmap',
		hoverinfo:'skip',
		colorscale:'Greys',
		showscale: false,
		ticks:""
	};

	var desViz_layout = {
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
			r: 5,
			pad: 10
		},
		annotations: [get_annotation(design_id)]
	};

	// Text detailing the properties of selected designs
	function get_annotation(design_id){
		annotation = {
			xref: 'paper',
			yref: 'paper',
			x: 0.95,
			xanchor: 'right',
			y: -0.25,
			yanchor: 'bottom',
			text: 'Design #' + (design_id+1) + 
					'<br>{{Constants.objectives.0}}: ' + data.obj1[design_id].toFixed(1) + '  {{Constants.objectives.1}}: ' + data.obj2[design_id].toFixed(1) +
					'<br>{{Constants.constraints.0}}: ' + data.constr1[design_id].toFixed(1) + '  {{Constants.constraints.1}}: ' +  data.constr2[design_id].toFixed(1),
			showarrow: false,
			font: {
			  color: "black",
			  size: 16
			},
			align: 'left',
		  }
		return annotation
	}

	//Create plot
	config = {
	    displayModeBar: false,
	    staticPlot: true
	}
	Plotly.newPlot(desViz, [design], desViz_layout, config);

	// Restyle for new selected design
	function restyle_desViz(design_id){
		image = JSON.parse(data.image[design_id])
		image = image.map( x => subtract_arr_from_1(x) )
		annotation = get_annotation(design_id)
		
		Plotly.restyle(desViz, 'z', [image]);
		Plotly.relayout(desViz, 'annotations', [annotation])
	}

	// Create a 3x3 grid layout for metamaterial visualization
	function design_grid(image){
		n=-3
		x00 = image.slice(0,n).map(function(el, i) {el.slice(0,n)})
		x01 = image.slice(0,n)
		x02 = image.slice(0,n).map(function(el, i) {el.slice(-1*n)})
		x10 = image.map(function(el, i) {el.slice(0,n)})
		x11 = image
		x12 = image.map(function(el, i) {el.slice(-1*n)})
		x20 = image.slice(-1*n).map(function(el, i) {el.slice(0,n)})
		x21 = image.slice(-1*n)
		x22 = image.slice(-1*n).map(function(el, i) {el.slice(-1*n)})

		row1 = horzcat([x00, x01, x02])
		row2 = horzcat([x10, x11, x12])
		row3 = horzcat([x20, x21, x22])

		return [].concat(row1, row2, row3)
	}
}