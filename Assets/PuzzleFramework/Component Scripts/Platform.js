#pragma strict

private var editable_base_script : Editable;

// editable variables
private var moving_right 	: boolean = false;
private var moving_left 	: boolean = false;
private var moving_up 		: boolean = false;
private var moving_down 	: boolean = false;

// actions
var move_right : boolean = false;
var move_left : boolean = false;
var move_up : boolean = false;
var move_down : boolean = false;
var velocity : float = 1.0;
var distance : float = 100.0;
var target_pos : Vector2;

// reset variables
private var original_pos : Vector2;
private var r_velocity : float;
private var r_distance : float;
private var r_target_pos : Vector2;

private var action_timer : int = 0;
private var action_length : int = 600;

private var curr_x : float;
private var curr_y : float;
private var move_pos : Vector2;
private var PPU : float = 100;
private var move_action : boolean = false;
var cancel_moves : boolean = false;

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
		if (transform.position != target_pos && !cancel_moves)
		{
			move_pos = Vector2.MoveTowards(transform.position, target_pos, velocity * Time.deltaTime);
			transform.position = move_pos;
		} else {
			end_action();
		}
	}
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

	} else if (move_up)
	{
		target_pos = new Vector2(curr_x, curr_y + (distance / PPU));
		moving_up = true;

	} else if (move_down)
	{
		target_pos = new Vector2(curr_x, curr_y - (distance / PPU));
		moving_down = true;

	}

	move_action = true;
}

function end_action()
{
	move_action = false;
	move_right = false;
	move_left = false;
	move_up = false;
	move_down = false;
	moving_right = false;
	moving_left = false;
	moving_up = false;
	moving_down = false;
	editable_base_script.puzzle_object_handler.action_completed();
}

function reset()
{
	end_action();
	cancel_moves = false;

	transform.position = original_pos;
	
	target_pos = original_pos;
	velocity = r_velocity;
	distance = r_distance;
}

function OnTriggerEnter2D(collider : Collider2D)
{
	var col_obj = collider.gameObject;
	if (col_obj.tag == "puzzle_object")
	{
		col_obj.transform.parent = transform;

	} else if (col_obj.tag == "ground")
	{
		end_action();
	}
}

function OnTriggerExit2D(collider : Collider2D)
{
	var col_obj = collider.gameObject;
	if (col_obj.tag == "puzzle_object")
	{
		col_obj.transform.parent = null;
	}
}

function OnCollisionEnter2D(collision : Collision2D)
{

	var col_obj = collision.gameObject;
	Debug.Log(col_obj);

	if (col_obj.tag == "ground" || col_obj.tag == "puzzle_object")
	{
		Debug.Log("end");
		end_action();
	}
}