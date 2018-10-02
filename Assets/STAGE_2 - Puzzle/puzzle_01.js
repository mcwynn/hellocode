#pragma strict

import UnityEngine.UI;

// GameObject references
var roller_ball : GameObject;
var puzzle_door : GameObject;
var target : GameObject;
var target_txt : GameObject;
var puzzle_description : GameObject;
var puzzle_desc_box : Canvas;
var editor_object : GameObject;

// Sprite references
var terminal_on_sprite : Sprite;
var terminal_off_sprite : Sprite;

// EDITABLE variables
var distance_to_move : float;
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
private var P01_scope = text_editor_script.pyEngine.CreateScope();


// Base object Python code
// (EDITABLE variables: moving, velocity, move_dir) 
var base_code : String = "";


// UI Info String: Explain to the player what variables are editable
var user_info : String; 
user_info += "# Required Variables: #\n";
user_info += "\n";
user_info += "distance_to_move      # Floating Point - The distance the ball will roll.\n";


// Execute Base object code
var source = text_editor_script.pyEngine.CreateScriptSourceFromString(base_code);
source.Execute(P01_scope);

// Pre : Main loop
// Post: Handles showing the text box and sending target variable information 
// 		 to the text editor.
function Update()
{
	if (selected && !activated)
	{
		if (puzzle_desc_box.enabled == false)
		{
			editor_object.SendMessage("assign_target", this.gameObject, 
									  SendMessageOptions.DontRequireReceiver);
			puzzle_desc_box.enabled = true;
		}
	} else if (puzzle_desc_box.enabled == true) 
	{
		puzzle_desc_box.enabled = false;
	}
}


// Pre : None
// Post: Executes the player code and retrieves new variables.
function execute_code() 
{
	// add player code to the end of base code
	var exe_code = base_code + update_code + player_code;

	// execute code
	try {
		var source = text_editor_script.pyEngine.CreateScriptSourceFromString(exe_code);
		source.Execute(P01_scope);
	}

	catch (error : System.Exception) {  
    	Debug.LogException(error);
    }

	// reassign editable variables
	activated = true;
	distance_to_move = P01_scope.GetVariable.<float>("distance_to_move");

	if (activated)
	{
		roller_ball.GetComponent.<roller_ball>().activated = true;
		roller_ball.GetComponent.<roller_ball>().distance_to_move = distance_to_move;
	}

}

// Pre:  Needs the player's code as a string.
// Post: Gets the player's code and executes it.
function code_change(code : String) 
{
	player_code = code;
	execute_code();
}

// Pre : None
// Post: Sends the required variable information to the text editor.
function send_base_code()
{
	target_txt.GetComponent.<Text>().text = user_info;
}

// Pre:  Needs the result of the player's attempt as a boolean, 
//		 correct or incorrect. 
// Post: Opens the door if correct, resets puzzle if incorrect.
function victory_check(success : boolean)
{
	if (success)
	{
		Debug.Log("Success!");
		puzzle_door.SendMessage("Open", SendMessageOptions.DontRequireReceiver);
	} else{
		Debug.Log("Fail!");
		roller_ball.GetComponent.<roller_ball>().initialize_variables();
		roller_ball.GetComponent.<roller_ball>().reset_pos();
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
// Post: Selects the object.
function Deselected()
{
	this.gameObject.GetComponent.<SpriteRenderer>().sprite = terminal_off_sprite;
	selected = false;
}

// Pre:  None
// Post: Handles selecting and deselecting the object.
function use_object()
{
	if (selected)
	{
		Deselected();
	} else {
		Selected();
	}
}