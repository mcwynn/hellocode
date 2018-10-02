#pragma strict

// Author : Michael Wynn
// Purpose: Handles the platform functionality
//----------------------------------------------------------------------------

// NON-EDITABLE variables
var player_code : String = "";
var update_code : String;
private var y_pos : float;
private var dist_moved : float = 0;

// start and end points - determine where the platform will move
var start_point : GameObject;
var end_point : GameObject;

// EDITABLE variables
var power_on : boolean = true;
var curr_direction : int = 1; // 1 = up, -1 = down
var velocity : float = 1;
var move_distance : float = 100;
var move_direction : int = 0;

// Terminal Script reference
var text_editor_script : text_editor;

// Create scope for object
private var E1_scope = text_editor_script.pyEngine.CreateScope();


// Main Loop
function Update () 
{

	if (power_on) 
	{
		var pos : Vector2 = transform.position;
		var start_pos : Vector2 = start_point.transform.position;
		var end_pos : Vector2 = end_point.transform.position;

		// switch the direction currently moving if hit either start or end point
		// note: curr_direction of 1 = right/up, -1 = left/down.
		if ((pos.x > end_pos.x && curr_direction == 1) || 
			(pos.x < start_pos.x && curr_direction == -1) || 
			(pos.y > end_pos.y && curr_direction == 1) || 
			(pos.y < start_pos.y && curr_direction == -1))
		{
			curr_direction *= -1;
		}

		if (move_direction == 0)
		{
			transform.position.y += curr_direction * velocity * Time.deltaTime;
		} else {
			transform.position.x += curr_direction * velocity * Time.deltaTime;
		}
	}
}


// Helper Functions
//--------------------

// Pre:  Needs the code to run.
// Post: Assigns the code to the player_code variable and executes it.
function code_change(code : String) 
{
	player_code = code;
	execute_code();
}

// Pre:  None
// Post: Executes the code and reassigns the editable variables to the values 
//		 created by the player's code.
function execute_code() 
{
	// execute code
	var source6 = text_editor_script.pyEngine.CreateScriptSourceFromString(player_code);
	source6.Execute(E1_scope);

	// reassign editable variables
	power_on = E1_scope.GetVariable.<boolean>("power_on");
	velocity = E1_scope.GetVariable.<float>("velocity");
	move_distance = E1_scope.GetVariable.<float>("move_distance");
	move_direction = E1_scope.GetVariable.<float>("move_direction");

	move_end_point(move_distance, move_direction);
}

// Pre:  Needs the new move distance as a float, and the move direction as 1 or 0.
// Post: Resets the platform's position, and move the end point object to the new location.
function move_end_point(move_distance : float, move_direction : int)
{
	var start_pos : Vector2 = start_point.transform.position;
	transform.position = start_pos;

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
}