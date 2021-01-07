from otree.api import (
	models,
	widgets,
	BaseConstants,
	BaseSubsession,
	BaseGroup,
	BasePlayer,
	Currency as c,
	currency_range,
)
import numpy as np
import pandas as pd
import json
import metamaterial_design.static.design_evaluator.python as truss_model
import tensorflow as tf
import matplotlib.pyplot as plt
import PIL.Image as Image
import warnings
warnings.filterwarnings('ignore')

author = 'Ashish Chaudhari'

doc = """
Backend and frontend of a human-AI collaborative tool for metamaterial design
"""

class Constants(BaseConstants):
	name_in_url = 'metamaterial_design'
	players_per_group = None
	num_rounds = 1
	num_features = 10
	num_ticks = 13

	E = 0.7e09; # Young's Modulus for polymeric material (example: 10000 Pa)
	sel = 0.01; # Unit square side length (NOT individual truss length) (example: 5 cm)
	r = 5e-4 #element radius in m
	edgelist = np.array([[1,2], [1,6], [1,5], [1,4], [1,8], [2,3], [2,6], [2,5], [2,4], [2,7],
					[2,9], [3,6], [3,5], [3,4], [3,8], [5,6], [6,7], [6,8], [6,9], [4,5], 
					[5,7], [5,8], [5,9], [4,7], [4,8], [4,9], [7,8], [8,9]])-1;

	nucFac = 1;
	sidenum = (2*nucFac) + 1; 
	pos = truss_model.generateNC(sel, sidenum);
	target_c_ratio = 1; # Ratio of C22/C11 to target

	objectives = ['Stiffness', 'Volume Fraction']
	constraints = ['Feasibility', 'Stability']

class Subsession(BaseSubsession):

	decoder = tf.keras.models.load_model('metamaterial_design/static/decoder.h5')
	encoder_bitstring = tf.keras.models.load_model('metamaterial_design/static/encoder_bitstring.h5')

	def nodes(self):
		pos = Constants.pos
		sel = Constants.sel
		nodes = list()
		for i, p in enumerate(pos):
			nodes.append({'id':int(i), 'x':float(p[0]/sel), 'y':float(p[1]/sel)})
		return nodes

	def edges(self):
		edgelist = Constants.edgelist
		nodes = self.nodes()
		edges = list()
		for e in edgelist:
			edges.append({'id': str(e[0])+'-'+str(e[1]), 'source':nodes[e[0]], 'target':nodes[e[1]]})
		return edges

	def is_pareto_efficient(self, costs):
		"""
		Find the pareto-efficient points
		:param costs: An (n_points, n_costs) array
		:return: A (n_points, ) boolean array, indicating whether each point is Pareto efficient
		"""
		is_efficient = np.ones(costs.shape[0], dtype = bool)
		for i, c in enumerate(costs):
			is_efficient[i] = np.all(np.any(costs[:i]>=c, axis=1)) and np.all(np.any(costs[i+1:]>=c, axis=1))
		return is_efficient

	def convert_to_img(self, x):
		pos = Constants.pos
		edgelist = Constants.edgelist

		plt.ioff()
		fig, ax = plt.subplots()
		truss_model.show_meshplot(pos, edgelist, x, ifMatrix=False, ax=ax)
		
		fig.savefig('image.png', bbox_inches='tight')
		img = Image.open('image.png').convert('L').resize((28,28))
		x = np.array(img)<255
		
		return x.astype('int')
	
	def creating_session(self):
		if self.round_number == 1:
			# Reading data #Columns = design stiffness	volume_fraction	feasibility	stability vertical_lines horizontal_lines	diagonals	triangles	three_stars	image
			data = pd.read_csv("./metamaterial_design/static/metamaterial_designs_filtered.csv")

			# Adding pareto front information
			costs = data[['obj1', 'obj2']].values*np.array([[-1, 1]]) #Maximize stiffness and minimize volume fraction
			data['is_pareto'] = self.is_pareto_efficient(costs)
			data['id'] = np.arange(data.shape[0])
			self.session.vars = data.to_dict('list')

class Group(BaseGroup):
	pass

class Player(BasePlayer):

	def update_pareto(self):
		data = pd.DataFrame(self.session.vars) #dictionary
		n_data = data.shape[0]

		# Gather old responses
		prev_response = pd.DataFrame(self.participant.vars)

		# Gathering objectives data
		tem1 = data[['obj1', 'obj2']].values
		tem2 = prev_response[['obj1', 'obj2']].values
		costs = np.vstack([tem1, tem2])*np.array([[-1, 1]]) #Maximize stiffness and minimize volume fraction
		
		# Find new pareto and update databse
		ret = self.subsession.is_pareto_efficient(costs)
		# self.session.vars['is_pareto_new'] = ret[0:n_data].tolist()
		is_pareto_new = ret[0:n_data].tolist()
		self.participant.vars['is_pareto'] = ret[n_data:].tolist()
		
		return is_pareto_new

	def update_response_database(self, response):
		# Gather old responses
		prev_response = self.participant.vars
		for key in response.keys():
			if key not in prev_response:
				prev_response[key]=[]
			prev_response[key].append(response[key])

	def live_design_evaluator(self, data):
		#Load data even if it may be empty
		# x is a bitstring design vector
		# z is a feature vector
		x = np.array(data['x'])
		z = np.array(data['z'])

		if ~np.any(np.isin(z, ['', None, 'nan'])):
			x_img = self.subsession.decoder(z)
			x = self.subsession.encoder_bitstring(x_img)

		if np.any(np.isin(x, ['', None, 'nan'])):
			x = np.ones(Constants.edgelist.shape[0])

		# Running the design evaluator and creating a response
		obj1, obj2 = truss_model.multiobjectives(x, Constants.nucFac, Constants.sel, Constants.E, Constants.r, Constants.edgelist, 1)
		edges_des = Constants.edgelist[x.astype(bool)]
		constr1 = truss_model.feasibility(Constants.pos, edges_des)
		constr2 = truss_model.stability(Constants.sidenum, edges_des, Constants.pos)
		x_img = self.subsession.convert_to_img(x)
		image = json.dumps(x_img.tolist())
		design = json.dumps(x.tolist())
		response = dict(design=design, obj1=obj1, obj2=obj2, constr1=constr1, constr2=constr2, image=image, is_pareto=None)
		# Check if any element is int32
		for k, v in response.items():
			if isinstance(v, np.int32):
				response[k] = int(v)

		# Update databse and Check if pareto
		self.update_response_database(response)

		# Update pareto information; Returns pareto infroamtion for historic data
		is_pareto_new = self.update_pareto()

		# Retrive updated data rom database
		response_data = self.participant.vars

		return {self.id_in_group: dict(response_data=response_data, is_pareto_new=is_pareto_new)}

def custom_export(players):
	# header row
	yield ['session', 'participant_code', 'index', 'design', 'obj1', 'obj2', 'constr1', 'constr2', 'image']
	for p in players:
		data = p.participant.vars
		for index, d in data.items():
			yield [p.session.code, p.participant.code, index, d['design'], d['obj1'], d['obj2'], d['constr1'], d['constr2'], d['image']]