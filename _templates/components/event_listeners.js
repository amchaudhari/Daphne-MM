// featCreat
// Listen to generate design & test button
	document.getElementById("testDesign").addEventListener("click", onclickTestDesign, false);
	async function onclickTestDesign(){
		// design bitstring data x
		let x = []
		let z = ''

		// Check if the current app is the main app
		if ("{{ Constants.name_in_url }}" === "main" ||  "{{ Constants.name_in_url }}" === "automation_expt") {
			if ( activeTaskId === "design-tab") {
				// Return 0 for inactive link and 1 for active link
				var links = d3.selectAll('line.link')[0]
				x = links.map(function(d) {
					ret = d3.select(d).classed("hide")
					ret = ret ? 0 : 1
					return ret
				})
			} else if ( activeTaskId === "feature-tab" ) {
				// feature data z to design bitstring data
				image = await recontr_image.then(image => { 
					if (image.length === 0) {
						alert('Change feature values to generate and test new metamaterial.')
					} else {
						return image; 
					}
				})
				let x_bits = await design_generator.image_to_bitstring(image)
				x = await x_bits.squeeze().array()
			} else if ( activeTaskId === "generator-tab") {
				// Retrieve current image data
				// image = get_image(selected_curve, selected_point)
				// attributes = get_attributes(selected_curve, selected_point)
				// // do other things needed
				// ref_point = target_objectives.concat([1.])
				// let _reconstr_image = design_generator.design_suggestions(image, attributes, eta, ref_point)
				image = await recontr_image.then(image => { 
					if (image.length === 0) {
						alert('Change feature values to generate and test new metamaterial.')
					} else {
						return image; 
					}
				})
				let x_bits = await design_generator.image_to_bitstring(image)
				x = await x_bits.squeeze().array()
			}

			// Send the collected data to python for evaluating a design
			send_data = {
				'message':'test design',
				'x': x,
				'z': z,
				'points_checked': points_checked,
			}
			console.log(send_data)
		}

		// Check if the current app is for the goal orientation experiment
		if ("{{ Constants.name_in_url }}" === 'goal_orientation_expt') {
			if ( activeTaskId === "design-tab") {
				// Return 0 for inactive link and 1 for active link
				var links = d3.selectAll('line.link')[0]
				x = links.map(function(d) {
					ret = d3.select(d).classed("hide")
					ret = ret ? 0 : 1
					return ret
				})
			} else if ( activeTaskId == 'feature-tab' ) {
				let sliders = document.getElementsByClassName("slider-group");
				z = []
				for (let i = 0; i < sliders.length; i++) {
					z.push(step_values[sliders[i].__data__.active])
				}
			}
			// Send the collected data to python for evaluating a design
			send_data = {
				'message':'test design',
				'x': x,
				'z': z,
				'points_checked': points_checked,
			}
		}

		if (sum(x) > 0) {
			liveSend(send_data)
		} else {
			alert('Select atleast one link to test.')
		}

	}

	$('a[data-toggle="tab"]').on('click', function (e) {
		activeTaskId = e.target.id
	})