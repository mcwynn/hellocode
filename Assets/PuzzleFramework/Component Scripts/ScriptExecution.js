#pragma strict

private var exe_code : String = ""; //player's python code
private var code_exe_thread : Thread; //this thread is used to run the code that affects the game objects.
private var code_test_thread : Thread; //this thread is used to test the code for errors.

// find variables script
var find_variables_script : TextAsset;
var find_functions_script : TextAsset;
private var functions_script : String;

// script / object references
private var text_editor_script : text_editor;
private var curr_puzzle_base : PuzzleBase;
private var curr_obj_handler : PuzzleObjectHandler;
private var curr_puzzle_scope : ScriptScope;
private var curr_puzzle_actions : Array;
private var used_variable_values : Array = new Array();
private var test_scope : ScriptScope;
// errors
private var error_line_num : int = -1;
private var error_type : String = "";
private var error_message : String = "";
private var error_occurred : boolean = false;

// visualizer variables
private var curr_exe_line_no : int = 0;
private var find_variables : String;
private var used_variables : Array = new Array();
var line_pointer : GameObject;
var variables_txt : GameObject = null;
var pointer_start_loc : Vector2 = new Vector2(0, -47);
private var curr_pointer_pos : int = 0;
private var pointer_line_spacing : float = 15;


var execution_in_progress : boolean = false;
private var visualizing_script : boolean = false;


private var script_source : ScriptSource;

private var exe_thread_finished : boolean = false;
private var test_thread_finished : boolean = false;
private var show_variables : boolean = false;
private var function_gun_finished : boolean = false;

private var list_of_function_names : Array = new Array();


function Start()
{
	text_editor_script = GetComponent.<text_editor>();

	// get pointer start location
	pointer_start_loc = line_pointer.transform.localPosition;
	line_pointer.SetActive(false);

	// Initialize variable finder scripts
	find_variables = find_variables_script.text;
	functions_script = find_functions_script.text;
}

function Update()
{
	if (execution_in_progress)
	{

		if (visualizing_script && show_variables)
		{
			var local_variable_txt : String = "";

			if (curr_puzzle_scope.ContainsVariable("_line_num"))
			{
				curr_exe_line_no = curr_puzzle_scope.GetVariable.<int>("_line_num");

				if (curr_exe_line_no != curr_pointer_pos)
					align_pointer(curr_exe_line_no);
			}
			
			if (curr_puzzle_scope.ContainsVariable("_active_function"))
			{
				var active_function : int = curr_puzzle_scope.GetVariable.<int>("_active_function");

				if (active_function >= 0)
				{
					local_variable_txt = "\n<color='#E22641FF'>LOCAL SCOPE:</color>\n";
					//var function_name : String = list_of_function_names[active_function];
					//var function_obj = curr_puzzle_scope.GetVariable(function_name);

					//Debug.Log(Framework.python_engine.Operations.GetMember.<int>(function_obj, "a"));
					var local_variables : Array = curr_puzzle_scope.GetVariable.<Array>("_local_vars");
					Debug.Log(local_variables);
					for (var var_pair in local_variables)
					{
						var vars : String = var_pair.ToString();
						if (vars.length > 0)
						{	
							var comma_index : int = vars.IndexOf(",");
							var var_name : String = vars[2:comma_index - 1];
							var var_val : String = vars[comma_index + 2:-1];

							if ("module" in var_val)
							{
								if ("Box" in var_val)
									var_val = "Box object";
								if ("Platform" in var_val)
									var_val = "Platform object";
								if ("Point" in var_val)
									var_val = "Point object";
								if ("Capacitor" in var_val)
									var_val = "Capacitor object";
							}

							local_variable_txt += "<color='#0092CEFF'>" + var_name + "</color> <color='#484f4c'>=</color> " + var_val + "\n";
						}
						

					}

				}
			}
			
			
			GetComponent.<text_editor>().saved_curr_variables_txt = get_used_variable_txt() + local_variable_txt;
		}
		

		if (!curr_obj_handler.success_checked)
		{
			if (test_thread_finished)
			{
				// test script has finished, check if there were errors
				if (error_occurred)
				{
					Debug.Log("EEEEEEEEEEEE");
					error_occurred = false;
					show_error_message();
					execution_in_progress = false;
					
					curr_puzzle_base.failed_attempt();
					curr_obj_handler.success_checked = true;

				} else
				{	// no errors, run script
					// get used variables
					if (visualizing_script)
					{
						used_variables = curr_puzzle_scope.GetVariable.<Array>("_var_bank");
						create_used_variable_array();
						line_pointer.SetActive(true);
						show_variables = true;
						text_editor_script.start_visualizing_code();
					}

					curr_obj_handler.python_object_reset();

					curr_puzzle_scope = curr_obj_handler.python_local_scope;

					
					// Debug.Log(used_variables);
					// reset_variables();

					for (var puzzle_obj : GameObject in curr_obj_handler.linked_objects)
					{
						puzzle_obj.GetComponent.<Editable>().activate();
					}
					code_exe_thread = new Thread(_run_code_ingame);
					code_exe_thread.Start();
				}

				test_thread_finished = false;
			}

			if (exe_thread_finished)
			{
				// script has finished, check for success
				var player_var = null;

				if (curr_puzzle_base.code_var_condition)
				{
					if (curr_puzzle_scope.ContainsVariable(curr_puzzle_base.target_var_name))
						player_var = curr_puzzle_scope.GetVariable(curr_puzzle_base.target_var_name);
				}

				curr_puzzle_base.check_for_success(player_var);
				curr_obj_handler.success_checked = true;
				execution_in_progress = false;
				exe_thread_finished = false;

				if (visualizing_script)
				{
					line_pointer.SetActive(false);
				}
			}
		}
	}

	if (function_gun_finished)
	{
		function_gun_finished = false;

		if (error_occurred)
		{
			error_occurred = false;
			Framework.return_function_gun_data(null);
			show_error_message();
		} else {
			var ret_data = curr_puzzle_scope.GetVariable("return_val");
			Framework.return_function_gun_data(ret_data);
		}
	}
	
}

function reset()
{
	execution_in_progress = false;
	exe_thread_finished = false;
	test_thread_finished = false;
	line_pointer.transform.localPosition = pointer_start_loc;
	line_pointer.SetActive(false);
	curr_obj_handler.python_object_reset();
	curr_puzzle_scope = curr_obj_handler.python_local_scope;

}

function toggle_visualize()
{
	visualizing_script = !visualizing_script;
}

//-----------------------------------
// Script Execution Functions
//-----------------------------------

// Pre:  None
// Post: Executes the code and reassigns the editable variables to the values 
//		 created by the player's code.
function execute_code(code : String, object_code : boolean)
{	
	if (object_code)
	{
		curr_puzzle_base = Framework.terminal_target.GetComponent.<PuzzleBase>();
		curr_obj_handler = Framework.terminal_target.GetComponent.<PuzzleObjectHandler>();
		curr_puzzle_scope = curr_obj_handler.python_local_scope;
		//test_scope = new ScriptScope(curr_puzzle_scope);
		curr_puzzle_actions = curr_obj_handler.puzzle_actions;
		exe_code = code;
		execution_in_progress = true;

		code_test_thread = new Thread(_test_player_code);
		code_test_thread.Start();

	} else {
		curr_puzzle_scope = Framework.python_engine.CreateScope();
		exe_code = code;
		code_test_thread = new Thread(_test_function_gun_code);
		code_test_thread.Start();
	}
	
	
}

// Pre:  This is run in a secondary thread (code_exe_thread).
// Post: Parses the player's code, edits it to add in pauses for action methods,
//		 and then executes the edited code.
function _run_code_ingame()
{
	// if the script above ran successfully, place in game mechanic helpers, 
	// run code that affects the game world.
	var action_code : String = parse_script(exe_code);
	script_source = Framework.python_engine.CreateScriptSourceFromString(action_code);

	script_source.Execute(curr_puzzle_scope);	
	
	exe_thread_finished = true;
	Debug.Log("script run complete");
	code_exe_thread.Sleep(0);
	code_exe_thread.Abort();
}

function reset_variables()
{
	var object_names : String = "box box_0 box_1 box_2 box_3 box_4 box_5 platform platform_0 platform_1 platform_2 platform_3 platform_4 platform_5 point point_0 point_1 point_2 point_3 point_4 point_5";

	for (var i : int = 0; i < used_variables.length; i++)
	{

		if (curr_puzzle_scope.ContainsVariable(used_variables[i]))
		{
			Debug.Log(used_variables[i]);
			curr_puzzle_scope.SetVariable(used_variables[i], "Not Defined Yet");
		}
	}

}



//-----------------------------------
// Set Up Script For Execution Functions
//-----------------------------------

//
//
function parse_script(code : String)
{
	var original_lines : Array = new Array(code.Split("\n"[0]));
	var edited_code : String = functions_script;
	var carried_line : boolean = false;
	var action_code : String = "_start_action()\n";
	var while_loop : String = "while _action:\n";
	var sleep_code : String = "	time.sleep(0.1)\n";
	var sleep_code_vis : String = "time.sleep(2)\n";
	var line_id_str : String = "_set_line(";
	var line_id : int = 0;
	var nested_base_tabs : String = "";
	var nested_level : int = 0;
	var function_count : int = 0;
	var inside_function : boolean = false;
	var curr_function_tabs : String = "";

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
				if ("def" in curr_line)
				{
					edited_code += curr_line_tabs + "	" + "_set_active_function(" + function_count.ToString() + ")\n";
					inside_function = true;
				}

				edited_code += curr_line + "\n";
				if (visualizing_script)
				{
					edited_code += curr_line_tabs + line_id_str + line_id.ToString() + ")\n";
					edited_code += curr_line_tabs + sleep_code_vis;
				}
			} else 
			{
				edited_code += curr_line + "\n";
			}
		} else if ("for " in curr_line || "while " in curr_line || "if " in curr_line || 
					"else " in curr_line || "else:" in curr_line || "elif " in curr_line || 
					"def " in curr_line || "class " in curr_line)
		{
			if (":" in curr_line)
			{
				edited_code += curr_line + "\n";

				if ("def" in curr_line)
				{
					edited_code += curr_line_tabs + "	" + "_set_active_function(" + function_count.ToString() + ")\n";
					edited_code += curr_line_tabs + "	" + "_update_local_vars(locals())\n";
					inside_function = true;
					curr_function_tabs = curr_line_tabs;
				}

				if (visualizing_script)
				{
					edited_code += curr_line_tabs + "	" + line_id_str + line_id.ToString() + ")\n";
					edited_code += curr_line_tabs + "	" + "_update_local_vars(locals())\n";
					edited_code += curr_line_tabs + "	" + sleep_code_vis;
				}

				nested_level += 1;
				nested_base_tabs = nested_level * "	";



			} else 
			{
				carried_line = true;
				edited_code += curr_line + "\n";
			}
		} else if (contains_object_method)
		{
			edited_code += curr_line + "\n";
			if (visualizing_script)
				edited_code += curr_line_tabs + line_id_str + line_id.ToString() + ")\n";
				if (inside_function)
					edited_code += curr_line_tabs + "_update_local_vars(locals())\n";

			edited_code += curr_line_tabs + action_code;
			edited_code += curr_line_tabs + while_loop;
			edited_code += curr_line_tabs + sleep_code;

		} else 
		{
			if (line_is_blank)
			{
				if (nested_level > 0)
				{
					edited_code += nested_base_tabs + "\n";
				} else 
				{
					edited_code += "\n";
				}
			} else 
			{
				
				if (curr_line_tabs.length < nested_base_tabs.length)
				{
					if (inside_function)
					{
						if (curr_line_tabs.length <= curr_function_tabs.length)
						{
							inside_function = false;
							edited_code += nested_base_tabs + "_end_function(" + function_count.ToString() + ", locals())\n";
							edited_code += nested_base_tabs + "_clear_local_vars()\n";
							function_count++;
						}
					}

					var tab_difference = nested_base_tabs.length - curr_line_tabs.length;
					nested_level -= tab_difference;
					nested_base_tabs = nested_level * "	";
				}

				edited_code += curr_line + "\n";
				if (inside_function)
				{
					edited_code += curr_line_tabs + "_update_local_vars(locals())\n";
				}
			}

			


			if (visualizing_script)
			{
				if (!line_is_blank)
				{
					edited_code += curr_line_tabs + line_id_str + line_id.ToString() + ")\n";
					edited_code += curr_line_tabs + sleep_code_vis;
				}
				
			}
		}

		// increment line number identifier
		line_id++;
	}
	Debug.Log(edited_code);
	return edited_code;
}

//
//
function check_for_object_method(code_line : String) : boolean
{
	var contains_obj_method = false;
	for (var action_str : String in curr_puzzle_actions)
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

function create_used_variable_array()
{
	used_variable_values = new Array();
	for (var i : int = 0; i < used_variables.length; i++)
	{
		used_variable_values.Add(0);
	}

}

function get_used_variable_txt() : String
{
	var display_txt : String = "<color='#E22641FF'>GLOBAL SCOPE:</color>\n";
	
	for (var i : int = 0; i < used_variables.length; i++)
	{
		if (curr_puzzle_scope.ContainsVariable(used_variables[i]))
		{
			var value : String = curr_puzzle_scope.GetVariable(used_variables[i]).ToString();

			if ("IronPython" in value)
			{
				if ("PythonFunction" in value)
					value = "Defined Function Name";
			}
			display_txt += "<color='#0092CEFF'>" + used_variables[i].ToString() + "</color> <color='#484f4c'>= </color>" + value + "\n";
		}
	}


	// if (curr_puzzle_scope.ContainsVariable("_line_num"))
	// 	curr_exe_line_no = curr_puzzle_scope.GetVariable.<int>("_line_num");
	return display_txt;
}

function align_pointer(new_pos : int)
{
	var new_pointer_location : Vector2 = pointer_start_loc - new Vector2(0, new_pos * pointer_line_spacing);
	line_pointer.transform.localPosition = new_pointer_location;
	curr_pointer_pos = new_pos;
}

//-----------------------------------
// Checking For Errors Functions
//-----------------------------------

function _test_player_code()
{
	//var test_code : String = set_up_code_for_test_run(exe_code);
	script_source = Framework.python_engine.CreateScriptSourceFromString(exe_code + find_variables);
	try 
	{
		// check player's script for syntax and runtime errors
		script_source.Execute(curr_puzzle_scope);
		curr_puzzle_scope.SetVariable("_action", false);
		Debug.Log("no errors");
	}
	catch (caught_exception : Exception)
	{
		var exception_operations : ExceptionOperations = Framework.python_engine.GetService.<ExceptionOperations>(); 
    	var error : String = exception_operations.FormatException(caught_exception); 
		//Debug.Log(error);
		parse_error_message(error);
	}

	test_thread_finished = true;
	code_exe_thread.Sleep(0);
	code_exe_thread.Abort();
	
}

function _test_function_gun_code()
{
	//var test_code : String = set_up_code_for_test_run(exe_code);
	script_source = Framework.python_engine.CreateScriptSourceFromString(exe_code);
	try 
	{
		// check player's script for syntax and runtime errors
		script_source.Execute(curr_puzzle_scope);
		Debug.Log("no errors");

		//var ret_data = curr_puzzle_scope.GetVariable("return_val");
		//Framework.return_function_gun_data(ret_data);
	}
	catch (caught_exception : Exception)
	{
		//Framework.return_function_gun_data(null);
		var exception_operations : ExceptionOperations = Framework.python_engine.GetService.<ExceptionOperations>(); 
    	var error : String = exception_operations.FormatException(caught_exception); 
		//Debug.Log(error);
		parse_error_message(error);
	}

	function_gun_finished = true;
	code_exe_thread.Sleep(0);
	code_exe_thread.Abort();
	
}

//
//
function set_up_code_for_test_run(code : String)
{
	var original_lines : Array = new Array(code.Split("\n"[0]));
	var edited_code : String = functions_script;
	var carried_line : boolean = false;
	var action_code : String = "_start_action()\n";
	var while_loop : String = "while _action:\n";
	var sleep_code : String = "	time.sleep(0.1)\n";
	var sleep_code_vis : String = "time.sleep(2)\n";
	var line_id_str : String = "_set_line(";
	var line_id : int = 0;
	var nested_base_tabs : String = "";
	var nested_level : int = 0;

	var active_function : int = -1;
	var inside_function : boolean = false;

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
			} else 
			{
				edited_code += curr_line + "\n";
			}
		} else if ("for " in curr_line || "while " in curr_line || "if " in curr_line || 
					"else " in curr_line || "else:" in curr_line || "elif " in curr_line || 
					"def " in curr_line || "class " in curr_line)
		{
			if (":" in curr_line)
			{
				edited_code += curr_line + "\n";
				nested_level += 1;
				nested_base_tabs = nested_level * "	";

			} else 
			{
				carried_line = true;
				edited_code += curr_line + "\n";
			}

			if ("def" in curr_line)
			{
				var function_name : String = "";
				var i : int = curr_line.IndexOf("def") + 4;
				while (curr_line[i] != "(")
				{
					function_name += curr_line[i];
					i ++;
				}

				list_of_function_names.Add(function_name);
			}

		} else if (contains_object_method)
		{
			edited_code += curr_line + "\n";
		} else 
		{
			if (line_is_blank)
			{
				if (nested_level > 0)
				{
					edited_code += nested_base_tabs + "\n";
				} else 
				{
					edited_code += "\n";
				}
			} else 
			{
				edited_code += curr_line + "\n";

				if (curr_line_tabs.length < nested_base_tabs.length)
				{
					var tab_difference = nested_base_tabs.length - curr_line_tabs.length;
					nested_level -= tab_difference;
					nested_base_tabs = nested_level * "	";
				}
			}
		}

		// increment line number identifier
		line_id++;
	}

	edited_code += find_variables;
	Debug.Log(edited_code);
	return edited_code;
}

//
//
function show_error_message()
{
	GetComponent.<text_editor>().error_message(error_line_num, error_type, error_message);
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

	// Debug.Log(error_type);
	// Debug.Log(error);
	// Debug.Log(error_line_num);

	error_occurred = true;

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