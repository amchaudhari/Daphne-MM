	// Helper functions
// -------------------------------------------------------------------------------------

	// TRADESPACE PLOT
	function filter_points(x, th){
		if (x > th) {
			return 1 // Opacity of selected points
		} else {
			return 0.01
		}
	}

	// Hover info
	function get_hover_text (_data, is_response=false) {
		if (is_response) {
			data_str = '-new' // Response data, new
		} else {
			data_str = '-old' // Historic data, old
		}

		len = Object.keys(_data).length
		if (len === undefined || len === 0) {
			return ' '
		} else {
			var hover_text = _data.constr1.map(function(x,i){
				return '<br>{{Constants.constraints.0}}: ' + x.toFixed(1) + '<br>Design #' + (i+1).toFixed(0) + data_str
			});
			return hover_text
		}
	}

	function pareto_response_data(_data, _response_data) {
		len = Object.keys(_response_data).length
		if (len === undefined || len === 0) {
			return {'obj1': [], 'obj2':[] }
		} else {
			var_str = 'is_pareto_response' + player_id.toFixed(0)
			obj1 = _response_data.obj1.filter((x,i) =>_response_data.is_pareto[i])
								.concat( _data.obj1.filter((x,i) => _data[var_str][i]) )
								.map(x => around(x, 3))
			obj2 = _response_data.obj2.filter((x,i) =>_response_data.is_pareto[i])
								.concat( _data.obj2.filter((x,i) => _data[var_str][i]) )
								.map(x => around(x, 3))
			
			// Sort with the first objective and with the sec ond objective
			// obj2, indeces = sortWithIndeces(obj2)
			// obj1 = indeces.map(i => obj1[i])
			// obj1, indeces = sortWithIndeces(obj1)
			// obj2 = indeces.map(i => obj2[i])
			dummy_arr = obj1.map( function (x, i) { return [x, obj2[i]] });
			dummy_arr.sort(function (a, b) {
			    return a[0] - b[0] || a[1] - b[1];
			});
			dummy = {
				'obj1': dummy_arr.map( function (x, i) { return x[0] }),
				'obj2': dummy_arr.map( function (x, i) { return x[1] })
			}
			return dummy
		}
	}

	function update_tradespace_response(_response_data) {
		// This function updates the tradespace plot upon response from the design evaluator, which a designer triggers with input
		var data_update = {
		    'x': [_response_data.obj1],
			'y': [_response_data.obj2],
			'text': [get_hover_text(_response_data, is_response=true)],
		};

		var layout_update = {
			'updatemenus[1].buttons[1].args': [{'marker.opacity': [ _response_data.constr1.map( x => filter_points(x, constr1_th))] }, [1] ],
		}
		Plotly.update(tsViz, data_update, layout_update, [1])
	}

	function update_pareto_response(_data, _response_data) {
		pareto_data = pareto_response_data(_data, _response_data)
		var data_update = {
		    'x': [pareto_data.obj1],
			'y': [pareto_data.obj2],
		};
		Plotly.update(tsViz, data_update, {}, [3])
	}

	function changeSelectedDesign(curveNumber, pointNumber) {
		// Highlight the selected point by increasing its size
		_sizes = [...sizes]
		_symbols = [...symbols]
		_colors = [...colors]
		symbols_response = Array.apply(null, new Array(n_response)).map(function(){return response_symbol;})
		sizes_response = Array.apply(null, new Array(n_response)).map(function(){return big_size;})
		// Change size of the selected point for the historic tradespace only
		if (curveNumber === 0){
			_data = data
			is_response = false
			_sizes[pointNumber] = select_size;
			_symbols[pointNumber] = select_symbol;
			_colors[pointNumber] = select_color
			var update0 = {
				'marker.size': [_sizes],
				'marker.symbol': [_symbols],
				'marker.color': [_colors],	
			}
			var update1 = {
				'marker.size': [sizes_response],
				'marker.symbol': [symbols_response],
			}
		}
		if (curveNumber === 1 && n_response>0){
			_data = response_data
			is_response = true
			symbols_response[pointNumber] = select_symbol
			sizes_response[pointNumber] = select_size
			var update1 = {
				'marker.size': [sizes_response],
				'marker.symbol': [symbols_response],
			}
			var update0 = {
				'marker.size': [_sizes],
				'marker.symbol': [_symbols],
				'marker.color': [_colors],	
			}
			
		}
		Plotly.restyle(tsViz, update0, {}, [0]);
		Plotly.restyle(tsViz, update1, {}, [1]);

		// Update the design visualization tab
		update_design_visualization(_data, curveNumber, pointNumber)

		// Store new curve id and new point id
		selected_curve = curveNumber;
		selected_point = pointNumber;
	}

// -------------------------------------------------------------------------------------
	// DESIGN PLOT
	// Restyle for new selected design
	function update_design_visualization(_data, curveNumber, pointNumber){
		image = JSON.parse(_data.image[pointNumber])
		image = design_grid(image)
		image = image.map( x => subtract_arr_from_1(x) )
		annotation = get_annotation(_data, curveNumber, pointNumber)
		Plotly.restyle(desViz, 'z', [image]);
		Plotly.relayout(desViz, 'annotations', [annotation])
	}

		// Create a 3x3 grid layout for metamaterial visualization
	function design_grid(image){
		n=-2
		alpha = 0.3

		x_trim = image.slice(1,-1).map(function(el, i) {return el.slice(1,-1)})
		x_alpha = multiple_by_constant2D(x_trim, alpha)

		row1 = stitch(x_alpha, x_alpha, n, axis=1)
		row1 = stitch(row1, x_alpha, n, axis=1)

		row2 = stitch(x_alpha, x_trim, n, axis=1)
		row2 = stitch(row2, x_alpha, n, axis=1)

		row3 = stitch(x_alpha, x_alpha, n, axis=1)
		row3 = stitch(row3, x_alpha, n, axis=1)

		x_stitched = stitch(row1, row2, n, axis=0)
		x_stitched = stitch(x_stitched, row3, n, axis=0)

		return x_stitched
	}

		// Text detailing the properties of selected designs
	function get_annotation(_data, curveNumber, pointNumber){
		if (curveNumber === 1) {
			data_str = '-new' // Response data, new
		} else {
			data_str = '-existing' // Historic data, old
		}
		annotation = {
			xref: 'paper',
			yref: 'paper',
			x: 1,
			xanchor: 'right',
			y: -0.25,
			yanchor: 'bottom',
			text: 'Design #' + (pointNumber+1) + data_str + 
					'<br>{{Constants.objectives.0}}: ' + _data.obj1[pointNumber].toFixed(2) + '  {{Constants.objectives.1}}: ' + _data.obj2[pointNumber].toFixed(2) +
					'<br>{{Constants.constraints.0}}: ' + _data.constr1[pointNumber].toFixed(1),// + '  {{Constants.constraints.1}}: ' +  _data.constr2[pointNumber].toFixed(1),
			showarrow: false,
			font: {
			  color: "black",
			  size: 16
			},
			align: 'left',
		  }
		return annotation
	}