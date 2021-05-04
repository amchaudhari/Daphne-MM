// For generative design functions
// 1. Evaluate objective values of input image
// 2. Decode an image from input features
// 3. Encode features from an input image
// 4. Propose local features search for an input image

class DesignGenerator () {
	constuctor (encoder, decoder, regressor, decoder_bistring, image_size = 28) { 
		this.encoder = encoder
		this.decoder = decoder
		this.regressor = this.decoder_bistring
		this.image_size = image
	}

	encoder_input (_image_, _attr) {
		n_attr = tf.util.sizeFromShape(_attr.shape)
		n_sample = x_input.shape[0]

		x_input = _image.reshape([1, this.image_size, this.image_size, 1])
		y_ = _attr.reshape([1,1,1,n_attr])
		
		k = tf.ones([n_sample, this.image_size, this.image_size, 1])
		x_input = tf.concat([x_input, k*y_], 3)

		return x_input
	}

	features_superposition (_image, _attr, diff) {
		n_attr = n_attr = tf.util.sizeFromShape(diff.shape)
		diff = diff.reshape([1,n_attr])
		_attr = _attr.reshape([1,n_attr])

		x_input = this.encoder_input(_image, _attr)
		features = this.encoder(x_input)[2]

		new_features = features + diff
		h_new = tf.concat([new_features, _attr], 1)

		_reconstr_image = this.decoder(h_new)
		// _reconstr_image_bits = this.decoder_bistring.predict(_reconstr_image)
		// _reconstr_image = convert_to_img(np.squeeze(_reconstr_image_bits))
		
		return _reconstr_image
	}

	dummy_loss (h, ref_point) {
		cosine_loss = tf.keras.losses.CosineSimilarity(axis=1)
		f_pred = this.regressor(h)
		return 10*cosine_loss(ref_point, f_pred)
	}

	design_suggestions (_image, _attr, eta, ref_point = tf.constant([[1., 0., 1.]])) {
		// Get featues of input image
		x_input = this.encoder_input(_image, _attr)
		features = this.encoder(x_input)[2]
		_attr = tf.constant(_attr, dtype="float32")
		h = tf.concat([features, _attr[None,:]], 1)

		// Backpropagation
		const dummyloss_grad = tf.grads(dummy_loss)
		[dloss_dh, _] = dummyloss_grad([h, ref_point])
		delta_h = h*dloss_dh
		h_new = h-eta*delta_h
		
		_reconstr_image = this.decoder(h_new)
		// _reconstr_image_bits = self.decoder_bistring.predict(_reconstr_image)
		// _reconstr_image = convert_to_img(np.squeeze(_reconstr_image_bits))
		
		return _reconstr_image
	}


}