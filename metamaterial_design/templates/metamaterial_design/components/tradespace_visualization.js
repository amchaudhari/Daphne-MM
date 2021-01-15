{
	constr1_th=0.9
	constr2_th=0.9

	//graph settings
	var x_range = [-0.8, 0.4]
		y_range = [-0.1, 1]
	var button_layer_1_height = 1.2
	 	button_layer_2_height = 1.05
		button_offset_1 = 0.22
		button_offset_2 = 0.18

	function filter_points(x, th){
		if (x > th) {
			return 1 // Opacity of selected points
		} else {
			return 0.01
		}
	}

	// Plotly graphs
	var tradespace = {
		x: data.obj1,
		y: data.obj2,
		text: get_hover_text(data, is_response=false),
		colorscale: 'Hot',
		mode: 'markers',
		type: 'scatter',
		name: 'Old designs',
		marker:{size:sizes, color: colors, symbol:symbols, opacity:1},
		hovertemplate: '{{Constants.objectives.0}}: %{x:.2f}' +
					   '<br>{{Constants.objectives.1}}: %{y:.2f}' +
					   '%{text}' + 
					   '<extra></extra>',
		showlegend: true,
	  };

	var tradespace_response = {
		x: response_data.obj1,
		y: response_data.obj2,
		text: get_hover_text(response_data, is_response=true),
		colorscale: 'Hot',
		mode: 'markers',
		type: 'scatter',
		name: 'New designs',
		marker:{size:big_size, color: 'red', symbol:response_symbol, opacity:1},
		hovertemplate: '{{Constants.objectives.0}}: %{x:.2f}' +
					   '<br>{{Constants.objectives.1}}: %{y:.2f}' +
					   '%{text}' + 
					   '<extra></extra>',
		showlegend: true,
	}

	var pareto = {
		x: data.obj1.filter((x,i) =>data.is_pareto[i]),
		y: data.obj2.filter((x,i) =>data.is_pareto[i]),
		mode: 'lines',
		name: 'Best of old designs',
		showlegend: true,
		line: {"shape": 'vh', "dash": "dashdot", "color":'blue'},
	}

	_pareto_response_data = pareto_response_data(data, response_data)
	var pareto_response = {
		x: _pareto_response_data.obj1,
		y: _pareto_response_data.obj2,
		name: 'Best of old + new designs',
		mode: 'lines',
		showlegend: true,
		line: {"shape": 'vh', "dash": "dashdot", "color":'red'},
	}

	// Filter buttons 
	var updatemenus=[
		{
			buttons: [
				{
					args: ['marker.opacity', 1 ],
					label:'None',
					method:'restyle'
				},
				{
					args: ['marker.opacity', [data.constr1]],
					label: '{{Constants.constraints.0}}',
					method: 'restyle'
				},
				{
					args: ['marker.opacity', [data.constr2]],
					label:'{{Constants.constraints.1}}',
					method:'restyle'
				}
			],
			direction: 'left',
			// pad: {'r': 10, 't': 10},
			showactive: true,
			type: 'buttons',
			x: button_offset_1,
			xanchor: 'left',
			y: button_layer_1_height+0.02,
			yanchor: 'top'
		},
		{
			buttons: [
				{
					args: ['marker.opacity', 1],
					label:'None',
					method:'restyle'
				},
				{
					args: ['marker.opacity', [ data.constr1.map( x => filter_points(x, constr1_th)) ]],
					label: 'Feasibility>'+constr1_th,
					method: 'restyle'
				},
				{
					args: ['marker.opacity', [ data.constr2.map(  x => filter_points(x, constr2_th)) ]],
					label:'Stability>'+constr2_th,
					method:'restyle'
				},
				{
					args: ['marker.opacity', [ data.constr2.map(  (x,i) => filter_points( (x>constr2_th && data.constr1[i]> constr1_th) ? 1 : -1,  0)) ]],
					label:'Both',
					method:'restyle'
				}
			],
			direction: 'left',
			// pad: {'r': 10, 't': 10},
			showactive: true,
			type: 'buttons',
			x: button_offset_2,
			xanchor: 'left',
			y: button_layer_2_height+0.02,
			yanchor: 'top'
		}
	]

	var annotations = [
		{
		  	text: 'Colorscale by Constraint:',
		  	x: 0,
		  	y: button_layer_1_height,
		  	xref: 'paper',
		  	yref: 'paper',
		  	align: 'left',
		  	showarrow: false,
		  	font: {size: 14},
		},
		{
		  	text: 'Filter by Constraint:',
		  	x: 0,
		  	y: button_layer_2_height,
		  	xref: 'paper',
		  	yref: 'paper',
		  	align: 'left',
		  	showarrow: false,
		  	font: {size: 14},
		},
	]

	var tsViz_layout = {
		hovermode:'closest',
		updatemenus: updatemenus,
		annotations: annotations,
		xaxis: {
		   title: "{{Constants.goals.0}}"+ " " + "{{Constants.objectives.0}}",
		   // range: x_range,
		   showgrid: true
		},
		yaxis: {
		   title: "{{Constants.goals.1}}" + " " +"{{Constants.objectives.1}}",
		   // range: y_range,
		   showgrid: true
		},
		margin: {
		   t: 10,
		   r:10,
		   pad: 4
		},
		showlegend: true,
		legend: {
		   x: 1,
		   xanchor: 'right',
		   yanchor: 'top',
		   y: 1.2
		}
	};

	//div
	Plotly.newPlot(tsViz, [tradespace, tradespace_response, pareto_response, pareto], tsViz_layout, {displayModeBar: true, displaylogo: false});
	dragLayer = document.getElementsByClassName('nsewdrag')[0]

	// Hover events
	tsViz.on('plotly_hover', function(d){
		dragLayer.style.cursor = 'pointer'
		
		pt_number = d.points[0].pointNumber;
		curveNumber = d.points[0].curveNumber;
		
		if (curveNumber === 0) {
			_colors = d.points[0].data.marker.color;
			_colors[pt_number] = bright_color;
			
			var update = {
				'marker.color': [_colors]
			}
			Plotly.update(tsViz, update, {}, [curveNumber]);
		}
	})
	.on('plotly_unhover', function(d){
		dragLayer.style.cursor = ''
		
		pt_number = d.points[0].pointNumber;
		curveNumber = d.points[0].curveNumber;
		
		if (curveNumber === 0) {
			_colors = d.points[0].data.marker.color;
			_colors[pt_number] = normal_color;
			if (selected_curve === 0) {
				_colors[selected_point] = select_color;
			}
			
			var update = {
				'marker.color': [_colors]
			}
			Plotly.update(tsViz, update, {}, [curveNumber]);
		}
	});

	// Onclick events
	tsViz.on('plotly_click', function(d){

		// Collect identity of the selected point
		pointNumber = d.points[0].pointNumber; // New design id
		curveNumber = d.points[0].curveNumber;

		// Store which points are tested before this
		if (curveNumber == 0) {
			points_checked.push(pointNumber)
		}
		
		changeSelectedDesign(curveNumber, pointNumber)
	
	});
}