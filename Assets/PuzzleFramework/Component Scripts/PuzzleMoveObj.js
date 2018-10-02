#pragma strict

private var puzzle_base : PuzzleBase;

// Moveable Object
var move_obj : GameObject;

// start and end points - determine where the object will move
var start_point : GameObject;
var end_point : GameObject;
var start_pos : Vector2;
var end_pos : Vector2;

// Movement variables
var single_move : boolean = true;
var power_on : boolean = false;
var curr_pos : Vector2;
var curr_direction : int = 1; // 1 = up, -1 = down
var velocity : int = 1;

// Custom editable variables
var use_custom_variable : boolean;
var custom_variable_name : String;
var custom_variable;

// Victory condition
var correct_move_distance : int = 0;

// Movement variables
var move_distance : int = 100;
var move_direction : int = 0;

// Local Scope
var python_local_scope : ScriptScope;

function Start () 
{
	// Initialize Local Scope
	python_local_scope = Framework.python_engine.CreateScope();

	puzzle_base = GetComponent.<PuzzleBase>();
}

function Update () 
{
	if (power_on) 
	{
		curr_pos  = move_obj.transform.position;
		start_pos = start_point.transform.position;
		end_pos   = end_point.transform.position;

		// switch the direction currently moving if hit either start or end point
		// note: curr_direction of 1 = right/up, -1 = left/down.
		if ((curr_pos.x > end_pos.x && curr_direction == 1) || 
			(curr_pos.x < start_pos.x && curr_direction == -1) || 
			(curr_pos.y > end_pos.y && curr_direction == 1) || 
			(curr_pos.y < start_pos.y && curr_direction == -1))
		{
			if (!single_move)
				curr_direction *= -1;
			else
				power_on = false;
		}

		if (move_direction == 0)
		{
			move_obj.transform.position.y += curr_direction * velocity * Time.deltaTime;
		} else {
			move_obj.transform.position.x += curr_direction * velocity * Time.deltaTime;
		}
	}
}

//--------------------
// Helper Functions
//--------------------

// Pre:  None
// Post: Executes the code and reassigns the editable variables to the values 
//		 created by the player's code.
function execute_code(player_code) 
{
	// execute code
	var source_code = Framework.python_engine.CreateScriptSourceFromString(player_code);
	source_code.Execute(python_local_scope);

	if (!use_custom_variable)
	{
		// reassign editable variables
		move_distance = python_local_scope.GetVariable.<int>("move_distance");
		power_on = python_local_scope.GetVariable.<boolean>("power_on");
		velocity = python_local_scope.GetVariable.<int>("velocity");
		move_direction = python_local_scope.GetVariable.<int>("move_direction");

		move_end_point(move_distance, move_direction);

	} else {
		if (puzzle_base.victory_condition_int)
		{
			custom_variable = python_local_scope.GetVariable.<int>(custom_variable_name);

		} else if (puzzle_base.victory_condition_float)
		{
			custom_variable = python_local_scope.GetVariable.<float>(custom_variable_name);

		} else if (puzzle_base.victory_condition_str)
		{
			custom_variable = python_local_scope.GetVariable.<String>(custom_variable_name);
		}

		victory_check();
	}
	
}

// Pre:  Needs the new move distance as a float, and the move direction as 1 or 0.
// Post: Resets the platform's position, and move the end point object to the new location.
function move_end_point(move_distance : float, move_direction : int)
{
	var start_pos : Vector2 = start_point.transform.position;
	move_obj.transform.position = start_pos;
	
	var new_pos : Vector2;
	var pixel_conversion : int = 100;
	move_distance /= pixel_conversion;

	if (move_direction == 0)
	{
		new_pos = new Vector2(start_pos.x, start_pos.y + move_distance);
	} else {
		new_pos = new Vector2(start_pos.x + move_distance, start_pos.y);
	}

	end_point.transform.position = new_pos;

	victory_check();
}

function victory_check()
{
	var correct_solution = false;

	if (!use_custom_variable)
	{
		puzzle_base.victory_check_location(end_point.transform.localPosition);
	} else {
		if (puzzle_base.victory_condition_int)
		{
			correct_solution = puzzle_base.victory_check_int(custom_variable);

		} else if (puzzle_base.victory_condition_float)
		{
			correct_solution = puzzle_base.victory_check_float(custom_variable);

		} else if (puzzle_base.victory_condition_str)
		{
			correct_solution = puzzle_base.victory_check_str(custom_variable);
		}

		if (correct_solution)
			success();
	}
	
}

//
//
function success()
{
	power_on = true;
}