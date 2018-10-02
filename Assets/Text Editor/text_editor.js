#pragma strict

// Author : Michael Wynn
// Purpose: Handles the text editor window
//----------------------------------------------------------------------------

import IronPython;
import UnityEngine.UI;
import UnityEngine.EventSystems;

var target : GameObject;
var test_tgt : GameObject;
var player : GameObject;
var text_editor_inputField : GameObject;
var text_editor_canvas : Canvas;
var target_txt : GameObject;
var editor_tab : GameObject;
var gun_tab : GameObject;
var combat_code_tab : GameObject;
var combat_mode_command_list : GameObject;
var command_code_tab : GameObject;
var command_mode_command_list : GameObject;
var main_camera : Camera;

var puzzle_title_txt : Text;
var puzzle_info_txt : Text;
var puzzle_obj_name_txt : Text;
var puzzle_obj_type_txt : Text;

private var saved_puzzle_title_txt : String;
private var saved_puzzle_info_txt : String;
var saved_curr_variables_txt : String;
private var curr_variables_title_txt : String = "Current Variable Values";
private var currently_visualizing_code : boolean = false;

var normal_camera_pos : Vector2;
var editor_up_camera_pos : Vector2;

private var active_tab_color : Color = Color(0.075, 0.075, 0.075);
private var inactive_tab_color : Color = Color(0.025, 0.025, 0.025);

var closest_console : GameObject;
var dist_to_terminal : float;

// Initialize Python Interpreter
static var pyEngine = UnityPython.CreateEngine();
var pyScope = pyEngine.CreateScope();

var code : String;
var editor_up : boolean = false;

// static var test_var : boolean = true;
var error_message_box : GameObject;

// store editor strings
private var stored_editor : String = "";
private var stored_f_gun : String = "";
private var stored_combat_code : String = "";
private var stored_command_code : String = "";

var currently_editing : String = "editor";

private var info_tab_selected : int = 0;
private var tab_pos_front : float = 2;
private var tab_pos_back : float = 0;
var puzzle_info_panel : GameObject;
var var_values_panel : GameObject;

function Start()
{
	
	player = GameObject.FindGameObjectWithTag("player");
	normal_camera_pos = new Vector2(10, 0);
	editor_up_camera_pos = new Vector2(-1, 0);
	Framework.initialize_framework();

	Framework.UI = GameObject.FindGameObjectWithTag("UI");
	Framework.success_message = GameObject.Find("puzzle_alert_message");
	Framework.success_message_txt_main = GameObject.Find("puzzle_alert_main");

	Framework.success_message.SetActive(false);
}

// Main Loop function
function Update() 
{
	var key_action = Input.GetKey(KeyCode.E);
	var key_editor = Input.GetKeyDown(KeyCode.F1);
	var key_reset = Input.GetKey(KeyCode.R);

	// Find any terminals
	closest_console = helper.find_closest_tag(player, 'editable');

	// open/close text editor
	if (key_editor && player.GetComponent.<player>().idle) 
	{
		toggle_editor();
	}
	if (key_reset && !editor_up)
	{
		Framework.reset_targeted_puzzle();

		if (Framework.terminal_target != null)
		{
			player.transform.position = Framework.terminal_target.transform.position;
		}
	}

	if (currently_visualizing_code)
	{
		puzzle_info_txt.text = saved_curr_variables_txt;

		if (!GetComponent.<ScriptExecution>().execution_in_progress)
		{
			currently_visualizing_code = false;
		}
	}
}

// --------------------------------------------------
// Helper Functions
// --------------------------------------------------

// Pre:  Needs a game object
// Post: Assigns the current target for the code transfer as the game object.
function assign_target(new_target : GameObject)
{
	target = new_target;
	Framework.terminal_target = new_target;
}

// Pre:  None
// Post: Deselects the current target.
function deselect()
{
	target = null;
	Framework.terminal_target = null;
}

// Pre:  None
// Post: Clears the "required variables" area of the editor when no 
//		 target is selected.
function reset_ui_target_code()
{
	target_txt.GetComponent.<Text>().text = "No Target Selected.";
}

// Pre:  None
// Post: Grabs the string (code) from the text editor, 
//		 and assigns it to the code variable.
function get_script()
{
	if (currently_editing == "editor")
	{
		code = text_editor_inputField.GetComponent.<InputField>().text;
	}
}

//
//
function color_keywords()
{
	var text_field_txt = text_editor_inputField.GetComponent.<InputField>().text;
	// color keywords
	Debug.Log("check");
	if ("def" in text_field_txt)
		Debug.Log("color");
		text_field_txt = text_field_txt.Replace("def", "<color='#40BDFBFF'>def</color>");
}

//
//
function clean_color_codes()
{
	text_editor_inputField.GetComponent.<InputField>().text = code.Replace("<color='#40BDFBFF'>def</color>", "def");
}

//
//
function start_visualizing_code()
{
	currently_visualizing_code = true;
	puzzle_title_txt.text = curr_variables_title_txt;
	puzzle_info_txt.text = saved_curr_variables_txt;
	info_tab_selected = 1;
}

//
//
function assign_info_text(puzzle_title : String, puzzle_info : String)
{
	puzzle_title_txt.text = puzzle_title;
	puzzle_info_txt.text = puzzle_info;
	saved_puzzle_title_txt = puzzle_title;
	saved_puzzle_info_txt = puzzle_info;
}

// Pre:  None
// Post: Executes code string using Python interpreter, changes variables
function execute_script()
{
	if (currently_editing == "editor")
	{
		// send code to the target object
		//if (target != null) 
		if (Framework.terminal_target != null) 
		{
			//target.SendMessage("code_change", code, SendMessageOptions.DontRequireReceiver);
			Framework.execute_editor_code(code);
		}
	} else
	{
		//stored_f_gun = "";
		//stored_f_gun = text_editor_inputField.GetComponent.<InputField>().text;
		//player.SendMessage("assign_f_gun", stored_f_gun, SendMessageOptions.DontRequireReceiver);

		var new_code : String = text_editor_inputField.GetComponent.<InputField>().text;

		if (currently_editing == "f_gun")
			Framework.function_gun_code = new_code;
		else if (currently_editing == "combat_code")
			Framework.upload_sidekick_combat_code(new_code);
		else if (currently_editing == "command_code")
			Framework.upload_sidekick_command_code(new_code);
	}	

}

// Pre:  Needs the player object.
// Post: Finds and returns the closest 
function find_closest_console(player : GameObject) : GameObject 
{
	// Find all game objects with tag editable
	var game_objs : GameObject[];
	game_objs = GameObject.FindGameObjectsWithTag("editable"); 
	var closest : GameObject; 
	var distance = Mathf.Infinity; 
	var position = player.transform.position;

	// Iterate through them and find the closest one
	for (var curr_obj : GameObject in game_objs)  { 
		var curDistance = Vector2.Distance(curr_obj.transform.position, position); 
		if (curDistance < distance) { 
			closest = curr_obj; 
			distance = curDistance; 
		} 
	} 
	return closest;	
}

// --------------------------------------------------
// Handle multiple editor tabs, save and switch code
// --------------------------------------------------

// Pre:  Called by the function gun tab at the top of the editor.
// Post: Saves the current string to the respective area, 
//		 opens the saved function gun string.
function edit_f_gun()
{
	if (currently_editing == "editor")
	{
		// saves editor text, opens stored f_gun text
		stored_editor = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_f_gun;

		// revert tab colors
		//editor_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;

	}
	if (currently_editing == "combat_code")
	{
		// saves combat text, opens stored f_gun text
		stored_combat_code = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_f_gun;

		// revert tab colors
		//combat_code_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;
		combat_mode_command_list.SetActive(false);

	} else if (currently_editing == "command_code")
	{
		// saves command text, opens stored f_gun text
		stored_command_code = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_f_gun;

		// revert tab colors
		//command_code_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;
		command_mode_command_list.SetActive(false);
	}

	//gun_tab.GetComponent.<Button>().colors.normalColor = active_tab_color;
	currently_editing = "f_gun";
}

// Pre:  Called by the editor tab at the top of the editor.
// Post: Saves the current string to the respective area, 
//		 opens the saved editor string.
function edit_editor()
{
	if (currently_editing == "f_gun")
	{
		// saves f_gun text, opens stored editor text
		stored_f_gun = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_editor;

		// revert tab colors
		//gun_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;

	} else if (currently_editing == "combat_code")
	{
		// saves combat text, opens stored editor text
		stored_combat_code = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_editor;

		// revert tab colors
		//combat_code_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;
		combat_mode_command_list.SetActive(false);

	} else if (currently_editing == "command_code")
	{
		// saves command text, opens stored editor text
		stored_command_code = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_editor;

		// revert tab colors
		//command_code_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;
		command_mode_command_list.SetActive(false);
	}

	//editor_tab.GetComponent.<Button>().colors.normalColor = active_tab_color;
	currently_editing = "editor";
}

// Pre:  Called by the Combat tab at the top of the editor.
// Post: Saves the current string to the respective area, 
//		 opens the saved combat string.
function edit_combat_code()
{
	if (currently_editing == "f_gun")
	{
		// saves f_gun text, opens stored combat text
		stored_f_gun = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_combat_code;

		// revert tab colors
		//gun_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;

	} else if (currently_editing == "editor")
	{
		// saves editor text, opens stored combat text
		stored_editor = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_combat_code;

		// revert tab colors
		//editor_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;

	} else if (currently_editing == "command_code")
	{
		// saves command text, opens stored combat text
		stored_command_code = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_combat_code;

		// revert tab colors
		//command_code_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;
		command_mode_command_list.SetActive(false);
	}

	//combat_code_tab.GetComponent.<Button>().colors.normalColor = active_tab_color;
	currently_editing = "combat_code";
	combat_mode_command_list.SetActive(true);
}

// Pre:  Called by the Commands tab at the top of the editor.
// Post: Saves the current string to the respective area, 
//		 opens the saved combat string.
function edit_command_code()
{
	if (currently_editing == "f_gun")
	{
		// saves f_gun text, opens stored editor text
		stored_f_gun = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_command_code;

		// revert tab colors
		gun_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;

	} else if (currently_editing == "editor")
	{
		// saves editor text, opens stored editor text
		stored_editor = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_command_code;

		// revert tab colors
		editor_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;

	} else if (currently_editing == "combat_code")
	{
		// saves combat text, opens stored editor text
		stored_combat_code = text_editor_inputField.GetComponent.<InputField>().text;
		text_editor_inputField.GetComponent.<InputField>().text = stored_command_code;

		// revert tab colors
		combat_code_tab.GetComponent.<Button>().colors.normalColor = inactive_tab_color;
		combat_mode_command_list.SetActive(false);

	}

	command_code_tab.GetComponent.<Button>().colors.normalColor = active_tab_color;
	currently_editing = "command_code";
	command_mode_command_list.SetActive(true);
}

//
//
function toggle_editor()
{
	// open text editor
	if (!editor_up) 
	{
		editor_up = true;
		Framework.text_editor_active = true;
		player.GetComponent.<player>().editor_up = true;
		text_editor_canvas.enabled = true;
		main_camera.transform.localPosition -= editor_up_camera_pos;

		// makes the text field the focus object so the player doesn't 
		// need to click the text box first
		text_editor_inputField.GetComponent.<InputField>().ActivateInputField();

		// if the player has an editable object selected grab the base code from the object
		if (target != null) 
		{
			target.SendMessage("send_base_code", SendMessageOptions.DontRequireReceiver);
		}

	// close text editor
	} else
	{
		editor_up = false;
		Framework.text_editor_active = false;
		player.GetComponent.<player>().editor_up = false;
		text_editor_canvas.enabled = false;
		main_camera.transform.localPosition += editor_up_camera_pos;

		// resets the focus to the player. 
		// without this, if you hit spacebar it will execute the code again.
		EventSystem.current.SetSelectedGameObject(player, null);

		reset_ui_target_code();
	}

}

function clicked_on_info_tab(clicked_tab : int)
{
	if (clicked_tab == 0 && info_tab_selected != 0)
	{
		puzzle_title_txt.text = saved_puzzle_title_txt;
		puzzle_info_txt.text = saved_puzzle_info_txt;
		info_tab_selected = 0;

	} else if (info_tab_selected != 1) 
	{
		puzzle_title_txt.text = curr_variables_title_txt;
		puzzle_info_txt.text = saved_curr_variables_txt;

		info_tab_selected = 1;
	}
}

//
//
function error_message(line_num : int, type : String, message : String)
{
	Debug.Log("RRRR");
	var line_spacing : float = 15;
	var start_pos_y : float = error_message_box.GetComponent.<ErrorMessage>().original_pos.y;
	Debug.Log(line_num);
	// var e_msg_box : GameObject = Instantiate(error_message_box, transform.position, Quaternion.identity);
	error_message_box.SetActive(true);
	Debug.Log(error_message_box.transform.position);

	if (line_num > 1)
		error_message_box.transform.localPosition = new Vector2(error_message_box.transform.localPosition.x, 
																error_message_box.transform.localPosition.y - ((line_num - 1) * line_spacing));
		error_message_box.GetComponent.<ErrorMessage>().error_line_num = line_num;
	error_message_box.GetComponent.<ErrorMessage>().show_error(type, message);

}



// unused atm
//--------------------

// Pre:  Needs the code to check as a string
// Post: 
function test_syntax(code : String) : boolean
{
	var correct_syntax : boolean = true;
	//var errors = ErrorListener();
	var source = pyEngine.CreateScriptSourceFromString(code);
	//var error_listener : ErrorListener;
	var compiled_code = source.Compile();

	//if (error_listener.Errors.Count > 0) 
	//{
    //	Debug.Log("error!");
    //
    //	correct_syntax = false;
    //}
	return correct_syntax;
}


//Pre:  Event Handler for Left Mouse Click. Activates when left clicking on gameObject with 
//		a 2D collider attached to it.
/*/Post: Assigns new code target if clicked on a different object. Highlights new target.
function select_editable_object(new_target : GameObject) 
{
	if (target == null || new_target != target)
	{
		if (target != null)
		{
			CancelTarget();
		}

		target = new_target;
		target.SendMessage("Selected", SendMessageOptions.DontRequireReceiver);
	}

}*/