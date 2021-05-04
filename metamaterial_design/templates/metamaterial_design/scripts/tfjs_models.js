// For loading pre-trained tensorflow javascript models
// 1. Encoder
// 2. Decoder
// 3. Regressor
// 4. Evaluator
// 5. Decoder_bistring

const encoder = await tf.loadGraphModel("{{ static encoder/model.json }}").then(model => {
				    this._model = model;
				})

const decoder = await tf.loadGraphModel("{{ static decoder/model.json }}").then(model => {
				    this._model = model;
				})

const regressor = await tf.loadGraphModel("{{ static regressor/model.json }}").then(model => {
				    this._model = model;
				})

const decoder_bistring = await tf.loadLayersModel("{{ static decoder_bistring/model.json }}").then(model => {
				    this._model = model;
				})