#pragma strict

var spr_switch_up : Sprite;
var spr_switch_down : Sprite;
var pressed : boolean = false;

function OnTriggerEnter2D(collider : Collider2D)
{
	if (collider.gameObject.tag == "puzzle_object" || 
		collider.gameObject.tag == "player")
	{
		enter_presssed_state();
	}
}

function OnTriggerExit2D(collider : Collider2D)
{
	if (collider.gameObject.tag == "puzzle_object" || 
		collider.gameObject.tag == "player")
	{
		exit_presssed_state();
	}
}

function enter_presssed_state()
{
	pressed = true;
	GetComponent.<SpriteRenderer>().sprite = spr_switch_down;
}

function exit_presssed_state()
{
	pressed = false;
	GetComponent.<SpriteRenderer>().sprite = spr_switch_up;
}