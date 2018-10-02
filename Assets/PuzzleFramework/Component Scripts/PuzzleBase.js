#pragma strict

import UnityEngine.UI;

// Puzzle Information
var puzzle_title : String = "";
var puzzle_description : String = "";
var puzzle_required_var : String = "";
var targeted : boolean = false;

// Is not usable from start, set to true if you want to link it with another puzzle
var locked : boolean = false;

// victory check conditions
var object_location_condition : boolean = false;
var player_location_condition : boolean = false;
var pressure_switch_condition : boolean = false;
var switch_order_condition : boolean = false;
var code_var_condition : boolean = false;

var has_editable_obj : boolean = false;
var has_visualizer : boolean = false;
var has_switch : boolean = false;
var has_puzzle_info_box : boolean = false;

var has_var_linked_objs : boolean = false;
var has_list_linked_objs : boolean = false;

// GameObject references
var text_editor				: GameObject;
var editor_panel			: GameObject;
var target 					: GameObject;
var target_txt 				: GameObject;
var puzzle_desc_obj 		: GameObject;
var puzzle_desc_box 		: Canvas;
var header_txt				: GameObject;
var body_txt				: GameObject;
private var reset_button 	: GameObject;
var checkPoint				: GameObject;

// Sprite references
var ap_on_sprite 			: Sprite;
var ap_off_sprite 			: Sprite;

// Local Scope
var python_local_scope 		: ScriptScope;
var script_source			: ScriptSource;

// Puzzle code
var puzzle_base_code 		: String = "";
var base_code_is_editable 	: boolean = false;
var linked_objects_code 	: String = "";
private var player_exe_code	: String = "";
private var update_code 	: String = "\n";

// Victory Conditions
var puzzle_completed : boolean = false;
var puzzle_activated : boolean = false;
var victory_target_obj 		: GameObject;
private var check_for_player_location : boolean = false;
var player_inside_success_trig : boolean = false;

var target_var_name 		: String;
var victory_type_location 	: boolean = false;
var victory_type_int 		: boolean = false;
var victory_type_float 		: boolean = false;
var victory_type_str 		: boolean = false;
var victory_type_list 		: boolean = false;
var victory_type_switch 	: boolean = false;

var victory_condition_location : Vector2 = new Vector2(0, 0);
var victory_condition_int 	: int = 0;
var victory_condition_float : float = 0.0;
var victory_condition_str 	: String = "";
var victory_condition_list 	: String = "";

var successful_attempt : boolean = false;
private var success_message_displayed : boolean = false;
private var success_message_timer : int = 260;
private var SUCCESS_MESSAGE_TIMER_RESET : int = 260;

// Sprite Animation
private var animator : Animator;
var uses_animator : boolean = true;

// sound effects
var audio_source : AudioSource;
var sfx_error : AudioClip;
var sfx_success : AudioClip;
var sfx_reset : AudioClip;

function Start () 
{
	// // Initialize linked_objects
	// initialize_linked_objs();

	// // Initialize Local Scope
	// python_local_scope = Framework.python_engine.CreateScope();

	// puzzle_base_code = puzzle_base_code.Replace("\\n", "\n");

	// initialize_python_objects();
	
	// Add itself to the framework puzzles array
	Framework.puzzles.Add(this.gameObject);
	
	header_txt.GetComponent.<Text>().text = puzzle_title;
	body_txt.GetComponent.<Text>().text = puzzle_description;

	text_editor = GameObject.FindGameObjectWithTag("text_editor");
	editor_panel = GameObject.Find("TextEditor");

	reset_button = transform.Find("reset_button").gameObject;
	reset_button.SetActive(false);

	animator = GetComponent.<Animator>();
	audio_source = GetComponent.<AudioSource>();

}

function Update()
{
	if (success_message_displayed)
	{
		if (success_message_timer > 0)
		{
			success_message_timer--;
		} else {
			Framework.hide_success_message();
			success_message_timer = SUCCESS_MESSAGE_TIMER_RESET;
			success_message_displayed = false;
		}
	}

	if (!successful_attempt)
	{
		if (check_for_player_location)
		{
			if (player_inside_success_trig)
			{
				trigger_complete();
				successful_attempt = true;
			}
		}
	}
}

//--------------------
// Helper Functions
//--------------------

//
//
function victory_check_location(curr_pos : Vector2)
{
	var victory : boolean = false;
	if (curr_pos == victory_condition_location)
	{
		victory = true;
		trigger_complete();
	} else {
		failed_attempt();
	}
	return victory;
}

//
//
function victory_check_int(player_variable : int)
{
	var victory : boolean = false;
	if (player_variable == victory_condition_int)
	{
		victory = true;
		trigger_complete();
	} else {
		failed_attempt();
	}
	return victory;
}

//
//
function victory_check_float(player_variable : float)
{
	var victory : boolean = false;
	if (player_variable == victory_condition_float)
	{
		victory = true;
		trigger_complete();
	} else {
		failed_attempt();
	}
	return victory;
}

//
//
function victory_check_str(player_variable : String)
{
	var victory : boolean = false;
	if (player_variable == victory_condition_str)
	{
		victory = true;
		trigger_complete();
	} else {
		failed_attempt();
	}
	return victory;
}


//
//
function activate_puzzle(player_code : String)
{
	if (!locked)
	{
		if (!puzzle_activated)
		{

			if (has_editable_obj)
			{
				GetComponent.<PuzzleObjectHandler>().execute_code(player_code);
				puzzle_activated = true;

			} else if (has_visualizer)
			{
				GetComponent.<visualize_loop_test>().execute_code(player_code);

			}

			if (player_location_condition)
			{
				check_for_player_location = true;
			}
		}
	}
	
	
}

// send target object name to success trigger to be displayed with hack data
function send_target_obj_name()
{
	if (victory_target_obj != null)
	{
		var success_trigger : GameObject = transform.FindChild("success_trigger").gameObject;

		if (success_trigger != null)
		{
			var display_name : String = victory_target_obj.GetComponent.<Editable>().hack_display_name;
			success_trigger.GetComponent.<SuccessTrigger>().set_target_obj_name(display_name);
		}
	}
}


// sound effects
function sfx_play_success()
{
	audio_source.PlayOneShot(sfx_success, 1);
}
// sound effects
function sfx_play_error()
{
	audio_source.PlayOneShot(sfx_error, 1);
}

function trigger_complete()
{
	Framework.show_success_message();
	success_message_displayed = true;
	audio_source.PlayOneShot(sfx_success, 1);

	if (GetComponent.<PuzzleObjectHandler>().activation_obj != null)
		GetComponent.<PuzzleObjectHandler>().alert_activation_object();
}

function check_for_success(player_variable)
{
	if (object_location_condition || pressure_switch_condition)
	{
		if (successful_attempt)
		{
			Framework.show_success_message();
			success_message_displayed = true;
			audio_source.PlayOneShot(sfx_success, 1);

			if (GetComponent.<PuzzleObjectHandler>().activation_obj != null)
				GetComponent.<PuzzleObjectHandler>().alert_activation_object();

			if (checkPoint != null) {
				GameProgressHandler.updateCheckPoint (1, checkPoint.transform.position);
			}

		} else {
			failed_attempt();
		}
	} else if (player_location_condition)
	{
		

	} else if (code_var_condition)
	{
		if (player_variable != null)
		{
			if (victory_type_int)
				victory_check_int(player_variable);
			else if (victory_type_float)
				victory_check_float(player_variable);
			else if (victory_type_str)
				victory_check_str(player_variable);
		} else
		{
			failed_attempt();
		}
		

	}
	
}

function failed_attempt()
{
	Framework.show_fail_message();
	success_message_displayed = true;
	audio_source.PlayOneShot(sfx_error, 1);
	reset_button.SetActive(true);
}


// Pre:  None
// Post: Selects the object.
function Selected()
{
	if (!locked)
	{
		//GetComponent.<SpriteRenderer>().sprite = ap_on_sprite;
		if (uses_animator)
			animator.SetTrigger("boot");
		targeted = true;

		// sends the preset code to the text editor
		if (base_code_is_editable)
		{
			text_editor.GetComponent.<InputField>().text = puzzle_base_code;
		} else {
			text_editor.GetComponent.<InputField>().text = "";
		}
		

		// assigns this game object as the target for the code
		Framework.assign_terminal_target(this.gameObject);

		// send puzzle info to text editor
		send_puzzle_info();
	}

	// pops up the info box
	if (has_puzzle_info_box)
		puzzle_desc_box.enabled = true;
	else
		editor_panel.GetComponent.<text_editor>().toggle_editor();
}

// Pre:  None
// Post: Deselects the object.
function Deselected()
{
	//GetComponent.<SpriteRenderer>().sprite = ap_off_sprite;
	if (uses_animator)
		animator.SetTrigger("shutdown");
	targeted = false;

	// pops up the info box
	if (has_puzzle_info_box)
		puzzle_desc_box.enabled = false;
}

// Pre:  None
// Post: Selects or deselects the object.
function use_object()
{
	if (targeted)
	{
		Deselected();
	} else {
		Selected();
	}
}

//
//
function send_puzzle_info()
{
	// send puzzle title and description
	editor_panel.GetComponent.<text_editor>().assign_info_text(puzzle_title, puzzle_description);
	// editor_panel.GetComponent.<text_editor>().puzzle_title_txt.text = puzzle_title;
	// editor_panel.GetComponent.<text_editor>().puzzle_info_txt.text = puzzle_description;
	// editor_panel.GetComponent.<text_editor>().saved_puzzle_title_txt = puzzle_title;
	// editor_panel.GetComponent.<text_editor>().saved_puzzle_info_txt = puzzle_description;

	// send puzzle object information
	editor_panel.GetComponent.<text_editor>().puzzle_obj_name_txt.GetComponent.<Text>().text = GetComponent.<PuzzleObjectHandler>().obj_names;

}

// Pre:  None
// Post: Unlocks the puzzle.
function unlock()
{
	locked = false;
}

//
//
// function get_linked_object_data()
// {
	

// 	var python_objects : Array = new Array();

// 	for (var linked_obj : GameObject in linked_objects)
// 	{
// 		var python_obj = linked_obj.GetComponent.<Editable>().get_object_code();
// 		python_objects.Add(python_obj);
// 	}
	
// 	python_local_scope.SetVariable("linked_objects", python_objects);
// 	//python_local_scope.SetVariable("obj_0", test_link_obj.GetComponent.<Editable>().python_local_scope.GetVariable("object"));
// }

//
// //
// function update_linked_object_data()
// {
// 	var obj_index : int = 0;
// 	var python_objects : Array = python_local_scope.GetVariable.<Array>("linked_objects");


// 	for (var linked_obj : GameObject in linked_objects)
// 	{
// 		linked_obj.GetComponent.<Editable>().update_object_code(python_objects[obj_index]);
// 		obj_index++;
// 	}
// }

//
//
function reset()
{
	puzzle_activated = false;
	check_for_player_location = false;
	audio_source.PlayOneShot(sfx_reset, 1);
	reset_button.SetActive(false);

	if (has_var_linked_objs || has_list_linked_objs)
	{
		GetComponent.<PuzzleObjectHandler>().reset();
	}

	editor_panel.GetComponent.<ScriptExecution>().reset();
}

