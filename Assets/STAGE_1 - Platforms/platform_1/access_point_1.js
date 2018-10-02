#pragma strict

// Author : Michael Wynn
// Purpose: Handles the access point functionality
//----------------------------------------------------------------------------

import UnityEngine.UI;

// GameObject references
var platform 			: GameObject;
var text_editor 		: GameObject;
var editor_object 		: GameObject;
var target 				: GameObject;
var target_txt 			: GameObject;
var puzzle_description 	: GameObject;
var puzzle_desc_box 	: Canvas;

// Sprite references
var ap_on_sprite : Sprite;
var ap_off_sprite : Sprite;

// EDITABLE variables
var activated : boolean = false;

// NON-EDITABLE variables
var player_code : String = "";
var update_code : String;
var success : boolean = false;
var fail : boolean = false;
var selected : boolean = false;

// Terminal Script reference 
var text_editor_script : text_editor; 

// Create scope for object
private var A1_scope = text_editor_script.pyEngine.CreateScope();


// Base object Python code
// (EDITABLE variables: moving, velocity, move_dir) 
var base_code : String = "";


// UI Info String: Explain to the player what variables are editable
private var user_info : String; 
user_info += "# Required Variables: #\n";
user_info += "<color='#40BDFBFF'>power_on</color>       # Boolean : set True to activate the platform's movement.\n";
user_info += "<color='#40BDFBFF'>velocity</color>        # Floating point : the speed the platform moves.\n";
user_info += "<color='#40BDFBFF'>move_distance</color>   # Integer : the max distance the platform will move.\n";
user_info += "<color='#40BDFBFF'>move_direction</color>  # Integer : 0 = vertical, 1 = horizontal.\n";

// Preset Code
private var preset_code : String = "# Change the values to the variables below to progress.\n\n";
preset_code += "power_on = False\n";
preset_code += "velocity = 0\n";
preset_code += "move_distance = 0\n";
preset_code += "move_direction = 0\n";


// Main Loop function
function Update()
{
	// shows the puzzle information box
	if (selected)
	{
		if (puzzle_desc_box.enabled == false)
		{
			// sends the preset code to the text editor
			text_editor.GetComponent.<InputField>().text = preset_code;

			// assigns this game object as the target for the code in the text editor
			editor_object.SendMessage("assign_target", this.gameObject, 
									  SendMessageOptions.DontRequireReceiver);

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

// Pre:  Needs the code as a string.
// Post: Sends the code to the attached platform.
function code_change(code : String) 
{
	player_code = code;
	platform.GetComponent.<platform_1>().code_change(code);
}

// Pre:  None
// Post: Sends the 'Required Variables' text at the bottom of the editor to the editor.
function send_base_code()
{
	target_txt.GetComponent.<Text>().text = user_info;
}

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