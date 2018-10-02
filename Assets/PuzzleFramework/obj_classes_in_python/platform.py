class Editable:
	def __init__(self):
		self.x = 0.0
		self.y = 0.0
		self.moving_right = False
		self.moving_left = False
		self.moving_up = False
		self.moving_down = False

	def move_right(self):
		self.stop()
		self.moving_right = True

	def move_left(self):
		self.stop()
		self.moving_left = True

	def move_up(self):
		self.stop()
		self.moving_up = True

	def move_down(self):
		self.stop()
		self.moving_down = True
		
	def stop(self):
		self.moving_right = False
		self.moving_left = False
		self.moving_up = False
		self.moving_down = False

object = Editable()