from os import environ

SESSION_CONFIGS = [
		# dict(
		#    name='public_goods',
		#    display_name="Public Goods",
		#    num_demo_participants=3,
		#    app_sequence=['public_goods', 'payment_info']
		# ),
			dict(
			name='metamaterial_design',
			display_name="Metamaterial Design - HMI",
			num_demo_participants=3,
			app_sequence=['metamaterial_design'],
			task_duration=15*60,
			test_duration=7*60,
			instr_duration=5*60,
			performance_goal=0, #[0:'learning', 1:'performance']
		),
]

# if you set a property in SESSION_CONFIG_DEFAULTS, it will be inherited by all configs
# in SESSION_CONFIGS, except those that explicitly override it.
# the session config can be accessed from methods in your apps as self.session.config,
# e.g. self.session.config['participation_fee']

SESSION_CONFIG_DEFAULTS = dict(
		real_world_currency_per_point=1.00, participation_fee=0.00, doc=""
)

# ISO-639 code
# for example: de, fr, ja, ko, zh-hans
LANGUAGE_CODE = 'en'

# e.g. EUR, GBP, CNY, JPY
REAL_WORLD_CURRENCY_CODE = 'USD'
USE_POINTS = True

ADMIN_USERNAME = 'admin'
# for security, best to set admin password in an environment variable
ADMIN_PASSWORD = environ.get('OTREE_ADMIN_PASSWORD')

DEMO_PAGE_INTRO_HTML = """ """

SECRET_KEY = '_@*(t&)rk+@ak2std=cap8f$in!u$65*8hf-m7gv5cibh+#k3t'

# if an app is included in SESSION_CONFIGS, you don't need to list it here
INSTALLED_APPS = ['otree']
