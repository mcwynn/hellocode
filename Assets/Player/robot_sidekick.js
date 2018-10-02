#pragma strict

var player : GameObject;

// Main States
private var passive_mode : boolean = true;
private var command_mode : boolean = false;
private var combat_mode : boolean = false;

// Sub states
private var attacking : boolean = false;
private var following_player : boolean = false;
private var moving_towards_enemy : boolean = false;

// AI variables
var power_on : boolean = true;
var alert : boolean = false;

var facing : int = 1; // 1 = right, -1 = left
var move_speed : int = 6;
var velocity_x : float = 0;
var velocity_y : float = 0;
var view_dist : int = 15;
var atk_range : int = 10;
var atk_delay : int = 0;
private var atk_delay_reset : int = 200;
var MAX_HP : float = 20;
var hp : float = 20;
var health_bar : GameObject;

var knock_back : boolean = false;
var knock_back_timer : int = 0;
var knock_back_exit : int = 10;


// Passive Mode variables
var follow_dist_max : float = 8;
var follow_dist_min : float = 0.25;
var follow_dist_mid : float = 2;
// Combat Mode variables
private var nearest_enemy : GameObject;
private var nearest_enemy_pos : Vector2;
private var nearest_enemy_dist : float;
private var find_enemy_refresh_rate : int = 20;
// Command Mode variables
private var start_command_mode : boolean = false;
var end_command_mode : boolean = false;
private var curr_command_complete : boolean = false;
private var usable_distance : float = 1;
private var move_distance : float = 1;
private var move_position : Vector2;
private var moving : boolean = false;
private var find_usable_refresh_rate : int = 20;
private var using_object : boolean = false;
var command_queue : Array = new Array();
private var usable_tag : String = "usable";

// Sprites

private var move : Vector3;
private var player_pos : Vector2;
private var player_dist : float;
var bullet : GameObject;
private var bullet_spacing : int = 300;

function Update ()
{
	// alive
	if (power_on)
	{
		if (!Framework.text_editor_active)
		{
			if (Input.GetKey(KeyCode.O))
			{
				command_mode = true;
				start_command_mode = true;
				passive_mode = false;
				Debug.Log("Entering Command Mode!");

			} else if (Input.GetKey(KeyCode.U))
			{
				combat_mode = true;
				passive_mode = false;
				Debug.Log("Entering Combat Mode!");

			} else if (Input.GetKey(KeyCode.P))
			{
				combat_mode = false;
				passive_mode = true;
				Debug.Log("Entering Passive Mode!");
			}
		}

		// get player's position and distance
		player_pos = player.transform.position;
		player_dist = Vector2.Distance(player_pos, transform.position);

		// normal state, not in combat area or in exploring puzzle
		if (passive_mode)
		{
			// change facing and flip sprite
			if (player_pos.x > transform.position.x)
			{
				facing = 1;
				GetComponent.<SpriteRenderer>().flipX = false;
			} else
			{
				facing = -1;
				GetComponent.<SpriteRenderer>().flipX = true;
			}

			// move closer to player
			if (player_dist > follow_dist_max)
			{
				transform.position = Vector2.MoveTowards(transform.position, player_pos, move_speed * 2 * Time.deltaTime);

			} else if (player_dist > follow_dist_mid)
			{
				transform.position = Vector2.MoveTowards(transform.position, player_pos, move_speed * Time.deltaTime);

			} else if (player_dist > follow_dist_min && Mathf.Abs(GetComponent.<Rigidbody2D>().velocity.x) > 0.1)
			{
				transform.position = Vector2.MoveTowards(transform.position, player_pos, (move_speed / 2) * Time.deltaTime);

			}

			
		} else if (combat_mode)
		{
			// find nearest enemy object
			if (find_enemy_refresh_rate <= 0)
			{
				var curr_enemy_dist = find_nearest_enemy();
				if (curr_enemy_dist == null)
					curr_enemy_dist = 10000.0;
				Framework.run_combat_code(curr_enemy_dist);
				find_enemy_refresh_rate = 20;
			} else {
				find_enemy_refresh_rate--;
			}

			//
			if (atk_delay > 0)
				atk_delay--;

			// launch attack command
			if (attacking)
			{
				// change facing and flip sprite
				if (nearest_enemy_pos.x > transform.position.x)
				{
					facing = 1;
					GetComponent.<SpriteRenderer>().flipX = false;
				} else
				{
					facing = -1;
					GetComponent.<SpriteRenderer>().flipX = true;
				}

				Debug.Log("attacking");
				attacking = false;

				// reset attack delay
				atk_delay = atk_delay_reset;

				// set bullet position and instantiate bullet
				var bullet_start_pos : Vector2 = new Vector2(transform.position.x + facing, 
															 transform.position.y);
				var new_bullet = Instantiate(bullet, bullet_start_pos, Quaternion.identity);

				// add force to bullet
				new_bullet.GetComponent.<Rigidbody2D>().AddForce(new Vector2(bullet_spacing * facing * 2, 0));
			
			} else if (moving_towards_enemy)
			{
				// change facing and flip sprite
				if (nearest_enemy_pos.x > transform.position.x)
				{
					facing = 1;
					GetComponent.<SpriteRenderer>().flipX = false;
				} else
				{
					facing = -1;
					GetComponent.<SpriteRenderer>().flipX = true;
				}

				// move closer to enemy
				if (nearest_enemy_dist > follow_dist_mid)
				{
					transform.position = Vector2.MoveTowards(transform.position, nearest_enemy_pos, move_speed * Time.deltaTime);

				}

			} else if (following_player)
			{
				// change facing and flip sprite
				if (player_pos.x > transform.position.x)
				{
					facing = 1;
					GetComponent.<SpriteRenderer>().flipX = false;
				} else
				{
					facing = -1;
					GetComponent.<SpriteRenderer>().flipX = true;
				}

				// move closer to player
				if (player_dist > follow_dist_max)
				{
					transform.position = Vector2.MoveTowards(transform.position, player_pos, move_speed * 2 * Time.deltaTime);

				} else if (player_dist > follow_dist_mid)
				{
					transform.position = Vector2.MoveTowards(transform.position, player_pos, move_speed * Time.deltaTime);

				} else if (player_dist > follow_dist_min && Mathf.Abs(GetComponent.<Rigidbody2D>().velocity.x) > 0.1)
				{
					transform.position = Vector2.MoveTowards(transform.position, player_pos, (move_speed / 2) * Time.deltaTime);

				}
			}
			
		} else if (command_mode)
		{
			if (start_command_mode)
			{
				command_queue = Framework.run_command_code();
				start_command_mode = false;
				get_next_order();
			}

			if (moving)
			{
				if (transform.position != move_position)
				{
					transform.position = Vector2.MoveTowards(transform.position, 
															 move_position, 
															 1 * Time.deltaTime);
				} else {
					moving = false;
					curr_command_complete = true;
				}


			}

			if (curr_command_complete)
			{
				get_next_order();
			}

		}

		if (knock_back)
		{
			if (knock_back_timer < knock_back_exit)
			{
				knock_back_timer++;
				GetComponent.<Rigidbody2D>().velocity.x = move_speed * -facing;
			} else {
				knock_back_timer = 0;
				knock_back = false;
			}
		}
	}
}


// ----------------------------------------------------------------
// Player Callable Functions : Functions called from player's code
// ----------------------------------------------------------------

// Pre: Must be in combat mode
// Post: Commands the robot to shoot in its facing direction
function start_attacking()
{
	Debug.Log("Attacking!");
	// cancel other states
	if (moving_towards_enemy)
		moving_towards_enemy = false;
	if (following_player)
		following_player = false;

	if (atk_delay <= 0 && !moving_towards_enemy)
	{
		Debug.Log("starting attack");
		attacking = true;
	}
	
}

// Pre: Must be in combat mode
// Post: Commands the robot to move toward the targeted enemy
function move_towards_enemy()
{
	Debug.Log("Moving!");
	// cancel other states
	if (attacking)
		attacking = false;
	if (following_player)
		following_player = false;

	moving_towards_enemy = true;
}

// Pre: Must be in combat mode
// Post: Commands the robot to follow the player
function follow_player()
{
	Debug.Log("Following!");
	// cancel other states
	if (attacking)
		attacking = false;
	if (moving_towards_enemy)
		moving_towards_enemy = false;

	following_player = true;
}


// ----------------------------------------------------------------
// Helper Functions
// ----------------------------------------------------------------

//
//
private function find_nearest_enemy() : float
{
	nearest_enemy = helper.find_closest_tag(this.gameObject, "robot");
	//Debug.Log(nearest_enemy);

	if (nearest_enemy != null)
	{
		Debug.Log("found enemy");
		nearest_enemy_pos = nearest_enemy.transform.position;
		nearest_enemy_dist = Vector2.Distance(nearest_enemy_pos, this.transform.position);
		//Debug.Log(nearest_enemy_dist);
	}

	return nearest_enemy_dist;
}

// Pre:  Useable object must have a function called 'use_object'.
// Post: Finds nearest useable object, caclulates the distance from player, 
//		 and uses the object if its close enough. Returns true if used, false if too far away.
private function use_object() : boolean
{
	var successful_use_attempt : boolean = false;

	// find closest object with the useable tag, then finds its distance from the player
	var nearest_useable_obj : GameObject = helper.find_closest_tag(this.gameObject, usable_tag);
	var obj_distance = Vector2.Distance(transform.position, 
										nearest_useable_obj.transform.position);

	// if close enough to use object, run 'use_object' function on nearest_useable_obj
	if (obj_distance <= usable_distance)
	{
		nearest_useable_obj.SendMessage("use_object", SendMessageOptions.DontRequireReceiver);
		successful_use_attempt = true;
	}
	return successful_use_attempt;
}

//
//
private function get_next_order()
{
	Debug.Log(command_queue.length);
	if (command_queue.length > 0)
	{
		curr_command_complete = false;
		var next_order : String = command_queue[0];
		command_queue.RemoveAt(0);

		if (next_order == 'use')
		{
			var successful_use_command : boolean = use_object();

			if (successful_use_command)
				Debug.Log("Got it!");
			else
				Debug.Log("There's nothing here!");
			curr_command_complete = true;

		} else {
			moving = true;

			if (next_order == 'right')
				move_position = transform.position + new Vector2(move_distance, 0);
			else if (next_order == 'left')
				move_position = transform.position + new Vector2(-move_distance, 0);
			else if (next_order == 'up')
				move_position = transform.position + new Vector2(0, move_distance);
			else if (next_order == 'down')
				move_position = transform.position + new Vector2(0, -move_distance);
		}
	} else {
		end_command_mode = true;
		command_mode = false;
		passive_mode = true;
	}
}



// function take_hit()
// {
// 	if (hp > 0)
// 	{
// 		hp -= 5;

// 		if (hp <= 0)
// 			power_on = false;

// 		var hp_percent : float = hp / MAX_HP;
// 		health_bar.transform.localScale = new Vector2(hp_percent, 1);
// 		knock_back = true;
// 	}
// }