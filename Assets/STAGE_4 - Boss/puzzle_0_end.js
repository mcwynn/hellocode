#pragma strict

// Author : Michael Wynn
// Purpose: Handles the boss puzzle
//----------------------------------------------------------------------------

import UnityEngine.UI;

// GameObject references
var puzzle_door 		: GameObject;
var target 				: GameObject;
var target_txt 			: GameObject;
var puzzle_description 	: GameObject;
var puzzle_desc_box 	: Canvas;
var editor_object 		: GameObject;
var text_editor			: GameObject;

// Sprite references
var terminal_on_sprite : Sprite;
var terminal_off_sprite : Sprite;

// EDITABLE variables
var player_mph : float;
var correct_mph : float = 77;
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
private var P02_scope = text_editor_script.pyEngine.CreateScope();


// Base object Python code
// (EDITABLE variables: moving, velocity, move_dir) 
var base_code : String = "";


// UI Info String: Explain to the player what variables are editable
var user_info : String; 
user_info += "# Required Variables: #\n";
user_info += "<color='#40BDFBFF'>mph</color>      # Floating Point - The speed needed to reach the destination in time.\n";


// Execute Base object code
var source = text_editor_script.pyEngine.CreateScriptSourceFromString(base_code);
source.Execute(P02_scope);


// Main Loop function
function Update()
{
	// shows the puzzle information box
	if (selected)
	{
		if (puzzle_desc_box.enabled == false)
		{
			// sends the preset code to the text editor
			text_editor.GetComponent.<InputField>().text = "";

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
	execute_code();
}

// Pre:  None
// Post: Executes the code and reassigns the editable variables to the values 
//		 created by the player's code.
function execute_code() 
{
	// add player code to the end of base code
	var exe_code = base_code + update_code + player_code;

	try {
		var source = text_editor_script.pyEngine.CreateScriptSourceFromString(exe_code);
		source.Execute(P02_scope);
	} 

	catch (error : System.Exception) {  
    	Debug.LogException(error);
    }

	// reassign editable variables
	player_mph = P02_scope.GetVariable.<float>("mph");

	victory_check(player_mph);

}

// Pre:  None
// Post: Sends the 'Required Variables' text at the bottom of the editor to the editor.
function send_base_code()
{
	target_txt.GetComponent.<Text>().text = user_info;
}

// Pre:  Needs the mph as a float.
// Post: Checks to see if the correct answer was given, opens the door if true.
function victory_check(mph : float)
{
	var success : boolean = false;

	if (mph == correct_mph)
		success = true;

	if (success)
	{
		Debug.Log("Success!");
		puzzle_door.SendMessage("Open", SendMessageOptions.DontRequireReceiver);

	} else{
		Debug.Log("Fail!");

	}
}

// Pre:  None
// Post: Selects the object.
function Selected()
{
	this.gameObject.GetComponent.<SpriteRenderer>().sprite = terminal_on_sprite;
	selected = true;
}

// Pre:  None
// Post: Deselects the object.
function Deselected()
{
	this.gameObject.GetComponent.<SpriteRenderer>().sprite = terminal_off_sprite;
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