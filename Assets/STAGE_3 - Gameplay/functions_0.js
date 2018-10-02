#pragma strict

// Author : Michael Wynn
// Purpose: Handles the function gun / blade info point
//----------------------------------------------------------------------------

import UnityEngine.UI;

// GameObject references
var text_editor 		: GameObject;
var player 				: GameObject;
var target 				: GameObject;
var target_txt 			: GameObject;
var puzzle_description 	: GameObject;
var puzzle_desc_box 	: Canvas;

// Sprite references
var ap_on_sprite : Sprite;
var ap_off_sprite : Sprite;

var selected : boolean = false;

private var useable_dist : float = 1.5;
private var nearest_tag : GameObject;
private var dist_from_nearest_tag : float;
private var switch_tag : String = "switch";


// Main Loop function
function Update()
{
	// shows the puzzle information box
	if (selected)
	{
		if (puzzle_desc_box.enabled == false)
		{
			// pops up the info box
			puzzle_desc_box.enabled = true;
		}

	} else if (puzzle_desc_box.enabled == true) 
	{
		puzzle_desc_box.enabled = false;
	}
}


// Helper Functions
//--------------------

// Pre:  None
// Post: Selects the object.
function Selected()
{
	this.gameObject.GetComponent.<SpriteRenderer>().sprite = ap_on_sprite;
	selected = true;
}

// Pre:  None
// Post: Deselects the object.
function Deselected()
{
	this.gameObject.GetComponent.<SpriteRenderer>().sprite = ap_off_sprite;
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