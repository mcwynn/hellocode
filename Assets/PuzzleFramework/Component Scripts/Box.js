#pragma strict

private var editable_base_script : Editable;

// editable variables
private var moving_right 	: boolean = false;
private var moving_left 	: boolean = false;

// actions
var move_right : boolean = false;
var move_left : boolean = false;
var velocity : float = 1.0;
var distance : float = 100.0;
var target_pos : Vector2;

// reset variables
private var original_pos : Vector2;
private var r_velocity : float;
private var r_distance : float;
private var r_target_pos : Vector2;

private var action_timer : float = 0;
private var action_length : int = 600;

private var curr_x : float;
private var curr_y : float;
private var last_x : float;
private var last_y : float;
private var move_pos : Vector2;
private var PPU : float = 100;
private var move_action : boolean = false;
var cancel_moves : boolean = false;
private var starting_pos : Vector2;

private var wait_for_movement : int = 10;
private var WAIT_FOR_MOVEMENT_RESET : int = wait_for_movement; 

function Start() 
{
	editable_base_script = GetComponent.<Editable>();
	original_pos = transform.position;
	r_velocity = velocity;
	r_distance = distance;
}

function Update() 
{
	curr_x = transform.position.x;
	curr_y = transform.position.y;

	if (move_action)
	{
		action_timer += 1 * Time.deltaTime;
		if (action_timer > 300f / 60f)
			end_action();

		// if (curr_y > starting_pos.y + 0.1 || curr_y < starting_pos.y - 0.1)
		// {
		// 	cancel_moves = true;
		// }

		if (curr_y == last_y)
		{
			if (transform.position != target_pos && !cancel_moves)
			{
				move_pos = Vector2.MoveTowards(transform.position, target_pos, velocity * Time.deltaTime);
				transform.position = move_pos;
			} else {
				if (wait_for_movement > 0 && curr_y == last_y)
				{
					wait_for_movement--;
				} else if (wait_for_movement <= 0)
				{
					end_action();
					wait_for_movement = WAIT_FOR_MOVEMENT_RESET;
				}
			}
		} else {
			target_pos.y = curr_y;
		}
	}
}

function LateUpdate()
{
	last_x = curr_x;
	last_y = curr_y;
}

function action()
{
	if (move_right)
	{
		target_pos = new Vector2(curr_x + (distance / PPU), curr_y);
		moving_right = true;

	} else if (move_left)
	{
		target_pos = new Vector2(curr_x - (distance / PPU), curr_y);
		moving_left = true;

	}
	starting_pos = transform.position;
	move_action = true;
}

function end_action()
{
	action_timer = 0;
	move_action = false;
	move_right = false;
	move_left = false;
	moving_right = false;
	moving_left = false;
	editable_base_script.puzzle_object_handler.action_completed();
}

function reset()
{
	end_action();

	transform.position = original_pos;

	target_pos = original_pos;
	cancel_moves = false;
	velocity = r_velocity;
	distance = r_distance;
}