// Global variables
var data = js_vars.data; // Historic data; constant
var	n_data = data.obj1.length
var feature_images = js_vars.feature_images
var response_data = js_vars.response_data
if (response_data === undefined || Object.keys(response_data).length === 0){
	response_data = {}
} else {
	var n_response = response_data.obj1.length
}
var player_id = {{ player.id_in_subsession }}
const goals = js_vars.goals

var nodes = js_vars.nodes;
var edges = js_vars.edges;
const num_features= {{ Constants.num_features }};
const num_ticks= {{ Constants.num_ticks }};
const feature_names = js_vars.feature_names;

// marker setting
var normal_color = '#585858';
	bright_color = '#00FFFF';
	dull_color = '#e6e6e6';
	select_color = 'red'
var orig_color = normal_color; //dummy variable to store color
var colors = Array.apply(null, new Array(n_data)).map(function(){return normal_color});

var big_size = "10";
	small_size = "6";
	select_size = "14"
var sizes = Array.apply(null, new Array(n_data)).map(function(){return small_size;})

var normal_symbol = "circle";
	select_symbol = "cross-dot";
	response_symbol = 'triangle-up';
var symbols = Array.apply(null, new Array(n_data)).map(function(){return normal_symbol;})

// Tradespace plot condifg
var tsViz_config

// Initialize selected point on display
var selected_curve = 0
var selected_point = 9		

// DOM elements
var desViz = document.getElementById('desViz');
var tsViz = document.getElementById('tsViz');
var featCreat = document.getElementById('featCreat');

// Information to send back to database
var points_checked = [];