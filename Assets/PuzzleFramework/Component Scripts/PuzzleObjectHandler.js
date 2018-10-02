#pragma strict

private var puzzle_base : PuzzleBase;
var is_simple_run : boolean = false;
var is_action_run : boolean = false;
var linked_objects			: Array = new Array();
var link_obj_0 				: GameObject;
var link_obj_1 				: GameObject;
var link_obj_2 				: GameObject;
var link_obj_3 				: GameObject;
var link_obj_4 				: GameObject;
var link_obj_5 				: GameObject;
var link_obj_6 				: GameObject;
var link_obj_7 				: GameObject;
var link_obj_8 				: GameObject;
var link_obj_9 				: GameObject;
private var variable_names : Array = new Array();
private var sorted_puzzle_objs : Array = new Array();

private var switch_objects 	: Array = new Array();
var all_switches_are_pressed : boolean = false;
var switch_obj_0			: GameObject;
var switch_obj_1			: GameObject;
var switch_obj_2			: GameObject;
var switch_obj_3			: GameObject;

var activation_obj			: GameObject;

var puzzle_object_names : Array = new Array();
var puzzle_object_types : Array = new Array();
private var puzzle_boxes : Array = new Array();
private var puzzle_platforms : Array = new Array();
private var puzzle_points : Array = new Array();
private var puzzle_fans : Array = new Array();
private var puzzle_capacitors : Array = new Array();

var obj_names : String = "";
var obj_types : String = "";


var puzzle_base_code : String = "";
var python_local_scope : ScriptScope;
private var script_source : ScriptSource;
private var exe_code : String = "";
private var python_thread : Thread;
private var code_test_thread : Thread;
private var visualizing_action : boolean = false;
private var action_timer : int = 0;
private var action_length : int = 600;

var puzzle_actions : Array = new Array();

private var puzzle_triggers : Array = new Array();

var success_checked : boolean = false;

// errors
private var error_line_num : int = -1;
private var error_type : String = "";
private var error_message : String = "";
private var error_occurred : boolean = false;
private var quick_reset : boolean = false;

function Start() 
{
	puzzle_base = GetComponent.<PuzzleBase>();
	python_local_scope = Framework.python_engine.CreateScope();
	puzzle_base_code = puzzle_base_code.Replace("\\n", "\n");

	// Initialize linked_objects
	initialize_linked_objs();
	initialize_python_objects();
	initialize_puzzle_triggers();
	initialize_switch_objects();
	create_object_list_in_editor();
	puzzle_base.send_target_obj_name();
}

function Update ()
{
	if (puzzle_base.puzzle_activated && linked_objects.length > 0)
	{
		// update puzzle objects
		update_var_link_data();

		// check switches
		if (switch_objects.length > 0 && !success_checked)
		{
			var all_switches_are_pressed : boolean = check_switches();

			if (all_switches_are_pressed)
			{
				puzzle_base.successful_attempt = true;
			} else {
				puzzle_base.successful_attempt = false;
			}
		}

		// check if script execution thread created
		// if (python_thread != null && !success_checked)
		// {
		// 	// check if thread is active
		// 	if (!python_thread.IsAlive)
		// 	{
		// 		// script has finished, check for success
		// 		puzzle_base.check_for_success();
		// 		success_checked = true;
		// 	}
		// }

		// if (error_occurred)
		// {
		// 	error_occurred = false;
		// 	show_error_message();

		// }

		
	}
	
	
	
}

//--------------------
// Helper Functions
//--------------------

// Pre:  None
// Post: Executes the code and reassigns the editable variables to the values 
//		 created by the player's code.
function execute_code(player_code : String)
{
	// if (is_simple_run)
	// {
	// 	// execute code
	// 	var source_code = Framework.python_engine.CreateScriptSourceFromString(player_code);
	// 	source_code.Execute(python_local_scope);

	// 	if (linked_objects.length > 0)
	// 		update_var_link_data();

	// 		for (var linked_obj : GameObject in linked_objects)
	// 		{
	// 			linked_obj.GetComponent.<Editable>().activate();
	// 		}

	// } else if (is_action_run)
	// {
		
	// 	exe_code = player_code;

	// 	code_test_thread = new Thread(test_player_code);
	// 	code_test_thread.Start();
		
	// 	python_object_reset();
	// 	for (var linked_obj : GameObject in linked_objects)
	// 	{
	// 		linked_obj.GetComponent.<Editable>().activate();
	// 	}

	// 	python_thread = new Thread(run_action_code);
	// 	python_thread.Start();
	// }


	puzzle_base.editor_panel.GetComponent.<ScriptExecution>().execute_code(player_code, true);
}

// Pre:  This is run in a secondary thread (python_thread).
// Post: Parses the player's code, edits it to add in pauses for action methods,
//		 and then executes the edited code.
// function run_action_code()
// {
// 	// if the script above ran successfully, place in game mechanic helpers, 
// 	// run code that affects the game world.
// 	var action_code : String = parse_script(exe_code);
// 	script_source = Framework.python_engine.CreateScriptSourceFromString(action_code);

// 	script_source.Execute(python_local_scope);
// 	Debug.Log("no errors");
// 	python_thread.Sleep(0);
// 	python_thread.Abort();	
	
// 	Debug.Log("script run complete");


	
	
	
// }

// function test_player_code()
// {
// 	script_source = Framework.python_engine.CreateScriptSourceFromString(exe_code);
// 	try 
// 	{
// 		// check player's script for syntax and runtime errors
// 		script_source.Execute(python_local_scope);
// 		python_local_scope.SetVariable("_action", false);
// 	}
// 	catch (e : Exception)
// 	{
// 		var eo : ExceptionOperations = Framework.python_engine.GetService.<ExceptionOperations>(); 
//     	var error : String = eo.FormatException(e); 
// 		Debug.Log(error);
// 		parse_error_message(error);
// 	}
// }

//
//
function show_error_message()
{
	var txt_editor : GameObject = GameObject.Find("TextEditor");
	txt_editor.GetComponent.<text_editor>().error_message(error_line_num, error_type, error_message);
}

//
//
function parse_error_message(error : String)
{
	error_line_num = 0;
	error_type = "";
	error_message = "";

	if ("line" in error)
	{
		error_line_num = find_line_num_in_error(error);
	}
	if ("NameError" in error)
	{
		error_type = "NameError";
		error_message = get_name_error(error);
	}
	if ("SyntaxError" in error)
	{
		error_type = "SyntaxError";
		error_message = get_syntax_error(error);
	}

	Debug.Log(error_type);
	Debug.Log(error);
	Debug.Log(error_line_num);

	error_occurred = true;
	python_thread.Sleep(0);
	python_thread.Abort();
}


//
//
function find_line_num_in_error(error : String) : int
{
	var line_check : int = 0;
	var line_str : String = "";
	var check_for_num : String = '0123456789';
	var found_line_num : boolean = false;

	for (var i : int = 0; i < error.length; i++)
	{
		//var ch : String = error[i] as String;
		//Debug.Log(line_check);
		if (line_check == 0 && error[i] == "l" && !found_line_num)
		{
			line_check++;

		} else if (line_check == 1 && error[i] == 'i')
		{
			line_check++;

		} else if (line_check == 2 && error[i] == 'n')
		{
			line_check++;
			
		} else if (line_check == 3 && error[i] == 'e')
		{
			line_check++;
			
		} else if (line_check == 4)
		{
			line_check++;
		} else if (line_check > 4 && error[i] in check_for_num)
		{
			line_str += error[i];
			line_check++;
		} else if (line_check > 4)
		{
			found_line_num = true;
			line_check = 0;
		} else {
			line_check = 0;
		}
	}
	
	return int.Parse(line_str);
}

function get_name_error(error : String) : String
{
	var error_name : String = "";
	var name_check : int = 0;
	var start_index : int = error.IndexOf("NameError");
	Debug.Log(start_index);

	for (var i : int = start_index; i < error.length; i++)
	{
		//var ch : String = error[i] as String;

		if (name_check == 0 && error[i] == "'")
		{
			name_check++;

		} else if (name_check > 0 && error[i] != "'")
		{
			error_name += error[i];

		} else {
			name_check = 0;
		}
	}
	
	return "<color='#d20f18'>" + error_name + "</color> does not exist. Make sure it has been defined previously and is spelled correctly.";
}

//
//
function get_syntax_error(error : String) : String
{
	var error_message : String = "";
	var on_next_line : boolean = false;

	for (var line : String in new Array(error.Split("\n"[0])))
	{
		Debug.Log(line);
		// if (on_next_line)
		// {
		// 	error_message = line;
		// 	on_next_line = 

		if ("SyntaxError" in line)
		{
			error_message = line[13:];
			
		}
	}
	Debug.Log(error_message);
	return error_message;
}

//
//
function update_var_link_data()
{
	// iterate through all objects in the puzzle updating the variables 
	// and checking for an action.
	for (var i : int = 0; i < linked_objects.length; i++)
	{
		var action_method_called : boolean = false;
		var linked_obj : GameObject = linked_objects[i] as GameObject;
		var obj_name : String = linked_obj.GetComponent.<Editable>().hack_display_name;
		var python_object = python_local_scope.GetVariable(obj_name);

		if (linked_obj.GetComponent.<Editable>().type_platform)
		{
			if (is_action_run)
			{
				action_method_called = python_local_scope.GetVariable.<boolean>("_action");
				var p_action_called : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "action_called");

				if (action_method_called && p_action_called && !visualizing_action)
				{
					var p_moving_right : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "moving_right");
					var p_moving_left : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "moving_left");
					var p_moving_up : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "moving_up");
					var p_moving_down : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "moving_down");
					var p_velocity : float = Framework.python_engine.Operations.GetMember.<float>(python_object, "velocity");
					var p_distance : float = Framework.python_engine.Operations.GetMember.<float>(python_object, "distance");
					
					
					linked_obj.GetComponent.<Platform>().move_right = p_moving_right;
					linked_obj.GetComponent.<Platform>().move_left = p_moving_left;
					linked_obj.GetComponent.<Platform>().move_up = p_moving_up;
					linked_obj.GetComponent.<Platform>().move_down = p_moving_down;
					linked_obj.GetComponent.<Platform>().velocity = p_velocity;
					linked_obj.GetComponent.<Platform>().distance = p_distance;
					
					Framework.python_engine.Operations.InvokeMember(python_object, "clear_move");
					visualizing_action = true;
					linked_obj.GetComponent.<Platform>().action();			
					
				}
				
			}
		} else if (linked_obj.GetComponent.<Editable>().type_box)
		{
			if (is_action_run)
			{

				action_method_called = python_local_scope.GetVariable.<boolean>("_action");
				var b_action_called : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "action_called");
				if (action_method_called && b_action_called && !visualizing_action)
				{
					Debug.Log("boxx");
					var b_moving_right : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "moving_right");
					var b_moving_left : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "moving_left");
					var b_charge_level : float = Framework.python_engine.Operations.GetMember.<float>(python_object, "charge_level");
					//var b_distance : float = Framework.python_engine.Operations.GetMember.<float>(python_object, "distance");
					
					linked_obj.GetComponent.<Editable>().update_energy_level(b_charge_level);
					
					if (b_moving_right || b_moving_left)
					{
						Debug.Log(b_charge_level);
						if (b_charge_level >= 10)
						{
							linked_obj.GetComponent.<Box>().move_right = b_moving_right;
							linked_obj.GetComponent.<Box>().move_left = b_moving_left;
							//linked_obj.GetComponent.<Box>().distance = b_distance;
							
							Framework.python_engine.Operations.InvokeMember(python_object, "clear_move");

							if (linked_obj.GetComponent.<Editable>().uses_energy)
								Framework.python_engine.Operations.InvokeMember(python_object, "_drain");

							visualizing_action = true;
							linked_obj.GetComponent.<Box>().action();

						} else {
							Framework.python_engine.Operations.InvokeMember(python_object, "clear_move");
							linked_obj.GetComponent.<Box>().end_action();
						}

					} 
					
					
				}
				
			}
		} else if (linked_obj.GetComponent.<Editable>().type_fan)
		{
			if (is_action_run)
			{
				action_method_called = python_local_scope.GetVariable.<boolean>("_action");
				var f_action_called : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "action_called");

				var f_speed : float = Framework.python_engine.Operations.GetMember.<float>(python_object, "speed");
				linked_obj.GetComponent.<Fan>().fan_speed = f_speed;

				if (action_method_called && f_action_called && !visualizing_action)
				{
					Debug.Log("fan");
					var f_rotating_right : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "rotating_right");
					var f_rotating_left : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "rotating_left");
					
					var f_rot_velocity : float = Framework.python_engine.Operations.GetMember.<float>(python_object, "rotation_velocity");
					var f_rot_amount : float = Framework.python_engine.Operations.GetMember.<float>(python_object, "rotation_amount");
					
					linked_obj.GetComponent.<Fan>().rotate_right = f_rotating_right;
					linked_obj.GetComponent.<Fan>().rotate_left = f_rotating_left;
					linked_obj.GetComponent.<Fan>().rotation_velocity = f_rot_velocity;
					linked_obj.GetComponent.<Fan>().rotation_amount = f_rot_amount;
					
					Framework.python_engine.Operations.InvokeMember(python_object, "clear_actions");
					visualizing_action = true;
					linked_obj.GetComponent.<Fan>().action();
					
				}
				
			}
		} else if (linked_obj.GetComponent.<Editable>().type_capacitor)
		{
			if (is_action_run)
			{
				//action_method_called = python_local_scope.GetVariable.<boolean>("_action");
				//var c_action_called : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "action_called");

				var power_supply : float = Framework.python_engine.Operations.GetMember.<float>(python_object, "power_supply");
				var not_enough_power : boolean = Framework.python_engine.Operations.GetMember.<boolean>(python_object, "_not_enough_power");
				linked_obj.GetComponent.<Capacitor>().power_supply = power_supply;

				linked_obj.GetComponent.<Editable>().update_energy_level(power_supply);

				if (not_enough_power)
				{					
					Framework.python_engine.Operations.InvokeMember(python_object, "_clear");
					linked_obj.GetComponent.<Capacitor>().not_enough_power_for_action();
					
				}
				
			}
		}
	}
}

//
//
function reset()
{
	success_checked = false;

	for (var linked_obj : GameObject in linked_objects)
	{
		linked_obj.SendMessage("reset", SendMessageOptions.DontRequireReceiver);

		var obj_name : String = linked_obj.GetComponent.<Editable>().hack_display_name;
		var python_object = python_local_scope.GetVariable(obj_name);

		if (!linked_obj.GetComponent.<Editable>().type_point)
			Framework.python_engine.Operations.InvokeMember(python_object, "_reset");
	}



	if (python_thread != null)
		if (python_thread.IsAlive)
			python_thread.Abort();
}

//
//
function python_object_reset()
{
	for (var linked_obj : GameObject in linked_objects)
	{
		linked_obj.SendMessage("reset", SendMessageOptions.DontRequireReceiver);
	}

	for (var i : int = 0; i < linked_objects.length; i++)
	{
		var linked_obj : GameObject = linked_objects[i] as GameObject;
		var obj_name : String = linked_obj.GetComponent.<Editable>().hack_display_name;
		var python_object = python_local_scope.GetVariable(obj_name);

		if (!linked_obj.GetComponent.<Editable>().type_point)
		{
			Framework.python_engine.Operations.InvokeMember(python_object, "clear_move");
			Framework.python_engine.Operations.InvokeMember(python_object, "_reset");
		}
	}

	python_local_scope = Framework.python_engine.CreateScope();

	// Initialize linked_objects

	initialize_python_objects();

}

//
//
function action_completed()
{
	visualizing_action = false;
	python_local_scope.SetVariable("_action", false);

	for (var i : int = 0; i < linked_objects.length; i++)
	{
		var linked_obj : GameObject = linked_objects[i] as GameObject;
		var obj_name : String = linked_obj.GetComponent.<Editable>().hack_display_name;
		var python_object = python_local_scope.GetVariable(obj_name);

		var new_x : float = linked_obj.transform.position.x;
		var new_y : float = linked_obj.transform.position.y;
		Framework.python_engine.Operations.InvokeMember(python_object, "update_pos", new_x, new_y);
	}
}

//
//
function show_hack_data()
{

	for (var linked_obj : GameObject in linked_objects)
	{
		linked_obj.GetComponent.<Editable>().show_hack_data();
	}

	for (var trigger_obj : GameObject in puzzle_triggers)
	{
		if (trigger_obj.tag == "object_barrier")
		{
			trigger_obj.GetComponent.<ObjectBarrierTrigger>().show_hack_data();

		} else if (trigger_obj.tag == "success_trigger")
		{
			trigger_obj.GetComponent.<SuccessTrigger>().show_hack_data();
		}
	}
}

//
//
function hide_hack_data()
{
	for (var linked_obj : GameObject in linked_objects)
	{
		linked_obj.GetComponent.<Editable>().hide_hack_data();
	}

	for (var trigger_obj : GameObject in puzzle_triggers)
	{
		if (trigger_obj.tag == "object_barrier")
		{
			trigger_obj.GetComponent.<ObjectBarrierTrigger>().hide_hack_data();

		} else if (trigger_obj.tag == "success_trigger")
		{
			trigger_obj.GetComponent.<SuccessTrigger>().hide_hack_data();
		}
	}
}

//
//
function check_switches()
{
	var all_pressed : boolean = false;
	var num_activated : int = 0;

	for (var switch_obj : GameObject in switch_objects)
	{
		if (switch_obj.GetComponent.<PressureSwitch>().pressed)
		{
			num_activated++;
		}
	}

	if (num_activated == switch_objects.length)
		all_pressed = true;

	return all_pressed;
}

//
//
function alert_activation_object()
{
	if (activation_obj.tag == "door")
		activation_obj.GetComponent.<puzzle_door>().Open();
	else if (activation_obj.tag == "usable")
		activation_obj.GetComponent.<PuzzleBase>().unlock();
}


//--------------------------
// Initialization Functions
//--------------------------

//
//
function initialize_linked_objs()
{
	if (link_obj_0 != null)
		linked_objects.Add(link_obj_0);
	if (link_obj_1 != null)
		linked_objects.Add(link_obj_1);
	if (link_obj_2 != null)
		linked_objects.Add(link_obj_2);
	if (link_obj_3 != null)
		linked_objects.Add(link_obj_3);
	if (link_obj_4 != null)
		linked_objects.Add(link_obj_4);
	if (link_obj_5 != null)
		linked_objects.Add(link_obj_5);
	if (link_obj_6 != null)
		linked_objects.Add(link_obj_6);
	if (link_obj_7 != null)
		linked_objects.Add(link_obj_7);
	if (link_obj_8 != null)
		linked_objects.Add(link_obj_8);
	if (link_obj_9 != null)
		linked_objects.Add(link_obj_9);

	var times : int = 0;

	for (var i : int = 0; i < linked_objects.length; i++)
	{
		var linked_obj : GameObject = linked_objects[i] as GameObject;
		linked_obj.GetComponent.<Editable>().puzzle_object_handler = this;

		times++;

		if (linked_obj.GetComponent.<Editable>().type_box)
			puzzle_boxes.Add(linked_obj);

		else if (linked_obj.GetComponent.<Editable>().type_platform)
			puzzle_platforms.Add(linked_obj);

		else if (linked_obj.GetComponent.<Editable>().type_point)
			puzzle_points.Add(linked_obj);

		else if (linked_obj.GetComponent.<Editable>().type_fan)
			puzzle_fans.Add(linked_obj);

		else if (linked_obj.GetComponent.<Editable>().type_capacitor)
			puzzle_capacitors.Add(linked_obj);
	}
}

//
//
function initialize_switch_objects()
{
	if (switch_obj_0 != null)
		switch_objects.Add(switch_obj_0);
	if (switch_obj_1 != null)
		switch_objects.Add(switch_obj_1);
	if (switch_obj_2 != null)
		switch_objects.Add(switch_obj_2);
	if (switch_obj_3 != null)
		switch_objects.Add(switch_obj_3);
}

//
//
function get_var_link_data(linked_obj : GameObject)
{
	return linked_obj.GetComponent.<Editable>().get_object_code();
}

//
//
function set_up_object_arrays()
{

}

//
//
function initialize_python_objects()
{
	// creates the intial python variables for the editable objects
	create_python_variables();

	// set up update code: Run after the player's code to get the new values
	// for (var j : int = 0; j < linked_objects.length; j++)
	// {
	// 	var linked_obj : GameObject = linked_objects[j] as GameObject;

	// 	python_local_scope.SetVariable("obj_" + j.ToString(), 
	// 								   get_var_link_data(linked_obj));

	// 	// create actions array to use when parsing the player's code 
	// 	// to check for action methods
	// 	var python_object = python_local_scope.GetVariable("obj_" + j.ToString());
	// 	var object_actions : Array = Framework.python_engine.Operations.GetMember.<Array>(python_object, "actions");

	// 	for (var action_str : String in object_actions)
	// 	{
	// 		if (!(action_str in puzzle_actions))
	// 		{
	// 			puzzle_actions.Add(action_str);
	// 		}
	// 	}
	// }


	// place the python objects into the player's code
	// boxes
	if (puzzle_boxes.length > 0)
	{
		for (var box_index : int = 0; box_index < puzzle_boxes.length; box_index++)
		{
			var box_obj : GameObject = puzzle_boxes[box_index] as GameObject;
			if (puzzle_boxes.length == 1)
			{
				python_local_scope.SetVariable("box", get_var_link_data(box_obj));
				
			} else {
				python_local_scope.SetVariable("box_" + box_index.ToString(), 
										   	   get_var_link_data(box_obj));
			}
		}
	}

	// platforms
	if (puzzle_platforms.length > 0)
	{
		for (var plat_index : int = 0; plat_index < puzzle_platforms.length; plat_index++)
		{
			var plat_obj : GameObject = puzzle_platforms[plat_index] as GameObject;
			if (puzzle_platforms.length == 1)
			{
				python_local_scope.SetVariable("platform", get_var_link_data(plat_obj));
				
			} else {
				python_local_scope.SetVariable("platform_" + plat_index.ToString(), 
										   	   get_var_link_data(plat_obj));
			}
		}
	}
	

	// points
	if (puzzle_points.length > 0)
	{
		for (var pt_index : int = 0; pt_index < puzzle_points.length; pt_index++)
		{
			var point_obj : GameObject = puzzle_points[pt_index] as GameObject;
			if (puzzle_points.length == 1)
			{
				python_local_scope.SetVariable("point", get_var_link_data(point_obj));
				
			} else {
				python_local_scope.SetVariable("point_" + pt_index.ToString(), 
										   	   get_var_link_data(point_obj));
			}
		}
	}

	// capacitors
	if (puzzle_capacitors.length > 0)
	{
		for (var cap_index : int = 0; cap_index < puzzle_capacitors.length; cap_index++)
		{
			var cap_obj : GameObject = puzzle_capacitors[cap_index] as GameObject;
			if (puzzle_capacitors.length == 1)
			{
				python_local_scope.SetVariable("capacitor", get_var_link_data(cap_obj));
				
			} else {
				python_local_scope.SetVariable("capacitor_" + cap_index.ToString(), 
										   	   get_var_link_data(cap_obj));
			}
		}
	}


	for (var obj_name : String in variable_names)
	{
		// create actions array to use when parsing the player's code 
		// to check for action methods
		var python_object = python_local_scope.GetVariable(obj_name);
		var object_actions : Array = Framework.python_engine.Operations.GetMember.<Array>(python_object, "actions");

		for (var action_str : String in object_actions)
		{
			if (!(action_str in puzzle_actions))
			{
				puzzle_actions.Add(action_str);
			}
		}
	}
}

//
//
function create_python_variables()
{
	puzzle_base_code = "import time\n_action = False\n_line_num = 0\ndef _start_action():\n	global _action\n	_action = True\ndef _set_line(line):\n	global _line_num\n	_line_num = line\n";

	// set up base code: Run before the player's code.
	// this goes through the arrays for each type of object and adds in the variable name.
	// the first one sets up boxes/blocks.
	if (puzzle_boxes.length > 0)
	{
		for (var box_index : int = 0; box_index < puzzle_boxes.length; box_index++)
		{
			var box_obj : GameObject = puzzle_boxes[box_index] as GameObject;
			if (puzzle_boxes.length == 1)
			{
				puzzle_base_code += "box = None\n";
				box_obj.GetComponent.<Editable>().hack_display_name = "box";
				variable_names.Add("box");
			} else {
				puzzle_base_code += "box_" + box_index.ToString() + " = None\n";
				box_obj.GetComponent.<Editable>().hack_display_name = "box_" + box_index.ToString();
				variable_names.Add("box_" + box_index.ToString());
			}
		}
	}

	// sets up platforms.
	if (puzzle_platforms.length > 0)
	{
		for (var plat_index : int = 0; plat_index < puzzle_platforms.length; plat_index++)
		{
			var platform_obj : GameObject = puzzle_platforms[plat_index] as GameObject;
			if (puzzle_platforms.length == 1)
			{
				puzzle_base_code += "platform = None\n";
				platform_obj.GetComponent.<Editable>().hack_display_name = "platform";
				variable_names.Add("platform");
			} else {
				puzzle_base_code += "platform_" + plat_index.ToString() + " = None\n";
				platform_obj.GetComponent.<Editable>().hack_display_name = "platform_" + plat_index.ToString();
				variable_names.Add("platform_" + plat_index.ToString());
			}
		}
	}

	// sets up points.
	if (puzzle_points.length > 0)
	{
		for (var pt_index : int = 0; pt_index < puzzle_points.length; pt_index++)
		{
			var point_obj : GameObject = puzzle_points[pt_index] as GameObject;
			if (puzzle_points.length == 1)
			{
				puzzle_base_code += "point = None\n";
				point_obj.GetComponent.<Editable>().hack_display_name = "point";
				variable_names.Add("point");
			} else {
				puzzle_base_code += "point_" + pt_index.ToString() + " = None\n";
				point_obj.GetComponent.<Editable>().hack_display_name = "point_" + pt_index.ToString();
				variable_names.Add("point_" + pt_index.ToString());
			}
		}
	}

	// sets up capacitors.
	if (puzzle_capacitors.length > 0)
	{
		for (var cap_index : int = 0; cap_index < puzzle_capacitors.length; cap_index++)
		{
			var cap_obj : GameObject = puzzle_capacitors[cap_index] as GameObject;
			if (puzzle_capacitors.length == 1)
			{
				puzzle_base_code += "capacitor = None\n";
				cap_obj.GetComponent.<Editable>().hack_display_name = "capacitor";
				variable_names.Add("capacitor");
			} else {
				puzzle_base_code += "capacitor_" + cap_index.ToString() + " = None\n";
				cap_obj.GetComponent.<Editable>().hack_display_name = "capacitor_" + cap_index.ToString();
				variable_names.Add("capacitor_" + cap_index.ToString());
			}
		}
	}

	// execute the base code to place it in the scope
	script_source = Framework.python_engine.CreateScriptSourceFromString(puzzle_base_code);
	script_source.Execute(python_local_scope);
}

// Pre:  This should be run at initialization. The triggers need to be children of the puzzle controller.
// Post: Finds all the triggers connected to the puzzle and adds them to the puzzle_triggers array.
function initialize_puzzle_triggers()
{
	for (var child : Transform in this.gameObject.transform)
	{
		if (child.CompareTag("object_barrier") || child.CompareTag("success_trigger"))
		{
			puzzle_triggers.Add(child.gameObject);
		}
	}
}

//
//
function create_object_list_in_editor()
{
	for (var puzzle_obj : GameObject in linked_objects)
	{
		obj_names += puzzle_obj.GetComponent.<Editable>().hack_display_name + "\n";

		if (puzzle_obj.GetComponent.<Editable>().type_box)
			obj_types += "box\n";
		else if (puzzle_obj.GetComponent.<Editable>().type_platform)
			obj_types += "platform\n";
		else if (puzzle_obj.GetComponent.<Editable>().type_point)
			obj_types += "point\n";
		else if (puzzle_obj.GetComponent.<Editable>().type_capacitor)
			obj_types += "capacitor\n";
	}
}


//-----------------------------------
// Player's Script Parsing Functions
//-----------------------------------

//
//
function parse_script(code : String)
{
	var original_lines : Array = new Array(code.Split("\n"[0]));
	var edited_code : String = "";
	var carried_line : boolean = false;
	var action_code : String = "_start_action()\n";
	var while_loop : String = "while _action:\n";
	var sleep_code : String = "	time.sleep(0.1)\n";

	for (var curr_line : String in original_lines)
	{
		var line_is_blank = is_blank_line(curr_line);
		var curr_line_tabs = find_tabs(curr_line);
		var contains_object_method = check_for_object_method(curr_line);

		if (carried_line)
		{
			if (":" in curr_line)
			{
				carried_line = false;
				edited_code += curr_line + "\n";
			} else {
				edited_code += curr_line + "\n";
			}
		} else if ("for " in curr_line || "while " in curr_line || "if " in curr_line || 
					"else " in curr_line || "else:" in curr_line || "elif " in curr_line || 
					"def " in curr_line || "class " in curr_line)
		{
			if (":" in curr_line)
			{
				edited_code += curr_line + "\n";

			} else {
				carried_line = true;
				edited_code += curr_line + "\n";
			}
		} else if (contains_object_method)
		{
			edited_code += curr_line + "\n";
			edited_code += curr_line_tabs + action_code;
			edited_code += curr_line_tabs + while_loop;
			edited_code += curr_line_tabs + sleep_code;

		} else {
			edited_code += curr_line + "\n";		
		}

	}
	// Debug.Log(edited_code);
	return edited_code;
}

//
//
function check_for_object_method(code_line : String) : boolean
{
	var contains_obj_method = false;
	for (var action_str : String in puzzle_actions)
	{
		if (action_str in code_line)
			contains_obj_method = true;
	}

	return contains_obj_method;
}

//
//
function find_tabs(code_line : String) : String
{
	var str_tabs : String = "";
	var curr_char : int = 0;

	if (code_line != "")
	{
		while (code_line[curr_char] == "	")
		{
			str_tabs += code_line[curr_char];
			curr_char += 1;
		}
	}
	
	return str_tabs;
}

function is_blank_line(code_line : String) : boolean
{
	var is_blank = false;

	if (code_line.Trim().length == 0)
		is_blank = true;

	return is_blank;
}