#pragma strict

// Public Variables
var switched_on : boolean = false;
var player : GameObject;
var controller : GameObject;

// Private Variables
private var switch_tag : String = "switch";
private var useable_dist : float = 1.5;
private var nearest_tag : GameObject;
private var dist_from_nearest_tag : float;
private var action_completed : boolean;

// Sprite references
var spr_switch_up : Sprite;
var spr_switch_down : Sprite;

// Pre:  None
// Post: Sends the switch number to the access point.
function use_object()
{
	if (!action_completed)
	{
		action_completed = true;
		GetComponent.<SpriteRenderer>().sprite = spr_switch_down;
		controller.GetComponent.<assignment_0_c>().switch_activated(2);
	}
}

// Pre:  None
// Post: Resets the switch.
function Reset()
{
	action_completed = false;
	GetComponent.<SpriteRenderer>().sprite = spr_switch_up;
}