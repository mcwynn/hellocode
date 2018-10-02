#pragma strict

var puzzle_terminal : GameObject;

// Initial values
var correct_num_rot : float = 3.25;
var correct_dist : float = correct_num_rot * circum;
var error_margin : float = 0.25;
var init_activated : boolean = false;
var init_attempt_completed : boolean = false;
var init_num_rotations : float = 0;
var init_distance_traveled : float = 0;
var init_distance_to_move : float = 0;

var init_pos : Vector2;

private var move_speed : float = 1.5;
private var roll_speed : float = move_speed * 2;
private var PI : float = Mathf.PI;

private var radius : float = 1; //inches
private var circum : float = PI * (radius * 2);

// Changeable variables
var activated : boolean;
var attempt_completed : boolean;
var num_rotations : float;
var distance_traveled : float;
var distance_to_move : float;

// Pre:  Need to run this at startup.
// Post: Initialize or reset values.
function initialize_variables()
{
	activated = init_activated;
	attempt_completed = init_attempt_completed;
	num_rotations = init_num_rotations;
	distance_traveled = init_distance_traveled;
	distance_to_move = init_distance_to_move;
}

// Pre:  None
// Post: Resets the game object's position.
function reset_pos()
{
	transform.position = init_pos;
}

// Pre:  Runs once at startup.
// Post: Initializes the variables.
function Start ()
{
	initialize_variables();
	init_pos = new Vector2(transform.position.x, transform.position.y);
}

// Pre:  Main loop
// Post: Handles rolling the ball and checks if it rolled the correct distance.
function Update () 
{
	// rolls the ball to player determined distance
	if (activated && distance_traveled < distance_to_move)
	{
		transform.position.x += move_speed * Time.deltaTime;
		transform.Rotate(Vector3.back * roll_speed);

		distance_traveled += (roll_speed * 1.0067) * Time.deltaTime;
	} else if (activated) {
		attempt_completed = true;
	}
	
	// checks if correct distance, sends victory information to the parent obj.
	if (activated && attempt_completed && (distance_traveled <= correct_dist + error_margin && 
			   distance_traveled >= correct_dist - error_margin)) 
	{
		puzzle_terminal.SendMessage("victory_check", true, SendMessageOptions.DontRequireReceiver);
		activated = false;

	} else if (activated && attempt_completed && (distance_traveled > correct_dist + error_margin || 
			   distance_traveled < correct_dist - error_margin)) 
	{
		activated = false;
		puzzle_terminal.SendMessage("victory_check", false, SendMessageOptions.DontRequireReceiver);
	}

}