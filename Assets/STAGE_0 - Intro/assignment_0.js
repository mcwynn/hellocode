#pragma strict

import UnityEngine.UI;

// GameObject references
var text_editor : GameObject;
var player : GameObject;

var target : GameObject;
var target_txt : GameObject;
var puzzle_description : GameObject;
var puzzle_desc_box : Canvas;
var puzzle_door : GameObject;

// Sprite references
var ap_on_sprite : Sprite;
var ap_off_sprite : Sprite;

var success : boolean = false;
var fail : boolean = false;
var selected : boolean = false;
var use_type : String = "controller";

private var useable_dist : float = 1.5;
private var nearest_tag : GameObject;
private var dist_from_nearest_tag : float;
private var switch_tag : String = "switch";

var correct_order : int = 0;

var ball_is_moving : boolean = false;

var audio_source : AudioSource;
var sfx_error : AudioClip;
var sfx_success : AudioClip;

function Start()
{
	audio_source = GetComponent.<AudioSource>();
}

// Pre : Main loop
// Post: Handles the text box upon selecction and deselection
function Update()
{
	

	if (selected)
	{
		if (puzzle_desc_box.enabled == false)
		{
			puzzle_desc_box.enabled = true;
		}
	} else if (puzzle_desc_box.enabled == true) 
	{
		puzzle_desc_box.enabled = false;
	}
}


// Helper Functions
//--------------------

// Pre : None
// Post: Selects the object.
function Selected()
{
	GetComponent.<SpriteRenderer>().sprite = ap_on_sprite;
	selected = true;
}

// Pre : None
// Post: Deselects the object
function Deselected()
{
	GetComponent.<SpriteRenderer>().sprite = ap_off_sprite;
	selected = false;
}

// Pre:  None
// Post: Selects or deselects the object.
function use_object()
{
	if (selected)
	{
		Deselected();
	} else {
		Selected();
	}
}

// Pre:  Needs the pulled switches order/number.
// Post: activates the switch if pulled in the correct order.
function switch_activated(switch_order : int)
{
	var correct = false;

	if (switch_order == 0 && correct_order == 0)
	{
		correct_order = 1;
		correct = true;

	} else if (switch_order == 1 && correct_order == 1)
	{
		correct_order = 2;
		correct = true;

	} else if (switch_order == 2 && correct_order == 2)
	{
		correct_order = -1;
		correct = true;
		puzzle_door.SendMessage("Open", SendMessageOptions.DontRequireReceiver);
		audio_source.PlayOneShot(sfx_success, 1);

	}

	if (!correct)
		audio_source.PlayOneShot(sfx_error, 1);
	else
		ball_is_moving = true;

	return correct;
}