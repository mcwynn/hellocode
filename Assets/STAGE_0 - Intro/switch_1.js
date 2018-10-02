#pragma strict

// Public Variables
var switched_on : boolean = false;
var move_completed : boolean = false;
var ball : GameObject;
var player : GameObject;
var controller : GameObject;
var line : GameObject;

// Private Variables
private var move_dir : Vector2 = Vector2.right;
private var target_dist : float = 2.5;
private var curr_dist : float = 0;

private var switch_tag : String = "switch";
private var useable_dist : float = 1.5;
private var nearest_tag : GameObject;
private var dist_from_nearest_tag : float;
var correct : boolean = false;

// Sprite references
var spr_switch_up : Sprite;
var spr_switch_down : Sprite;

// Pre:  Main loop
// Post: handles moving the ball.
function Update () 
{
	if (switched_on && !move_completed)
	{
		if (curr_dist < target_dist)
		{
			ball.transform.position += move_dir * Time.deltaTime;
			curr_dist += 1 * Time.deltaTime;
		} else {
			move_completed = true;
			controller.GetComponent.<assignment_0>().ball_is_moving = false;
			line.GetComponent.<SpriteRenderer>().color = Color(0, 1, 0, 1);
		}
	}
}

// Pre:  None
// Post: Sends the switch number to the access point, resets if incorrect order.
function use_object()
{
	if (!controller.GetComponent.<assignment_0>().ball_is_moving)
	{
		correct = controller.GetComponent.<assignment_0>().switch_activated(1);

		if (correct)
		{
			switched_on = true;
			GetComponent.<SpriteRenderer>().sprite = spr_switch_down;
		} else {
			switched_on = false;
			GetComponent.<SpriteRenderer>().sprite = spr_switch_up;
		}
	}

	
}