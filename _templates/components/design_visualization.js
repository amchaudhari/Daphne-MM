{
	var design = {
		z: [],
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
		annotations: [get_annotation(data, selected_curve, selected_point)]
	};

	//Create plot
	config = {
	    displayModeBar: false,
	    staticPlot: true
	}
	Plotly.newPlot(desViz, [design], desViz_layout, config);
}