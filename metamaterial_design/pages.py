from otree.api import Currency as c, currency_range
from ._builtin import Page, WaitPage
from .models import Constants
import pandas as pd
import numpy as np
import pickle as pickle


class MyPage(Page):
	live_method = 'live_design_evaluator'

	timer_text = 'Time left to complete this part:'
	def get_timeout_seconds(self):
		return self.session.config['my_page_timeout_seconds']

	def js_vars(self):
		nodes = self.subsession.nodes()
		edges = self.subsession.edges()
		return dict(
			data = self.session.vars,
			response_data = self.participant.vars,
			nodes = nodes,
			edges = edges,
			feature_names = Constants.feature_names
		)

class ResultsWaitPage(WaitPage):
	pass


class Results(Page):
	pass


page_sequence = [MyPage, ResultsWaitPage, Results]
