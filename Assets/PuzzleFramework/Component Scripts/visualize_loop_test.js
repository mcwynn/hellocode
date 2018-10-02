#pragma strict

import System.Threading;
import Microsoft.Scripting;
import Microsoft.Scripting.Runtime;
import Microsoft.Scripting.Utils;

import IronPython.Modules;
import IronPython.Runtime.Exceptions;
import IronPython.Runtime.Operations;
import IronPython.Runtime.Types;

private var python_thread : Thread;
private var code : String;
private var edited_code : String;
private var test_code : String;
private var curr_exe_line_no : int = 0;
private var find_variables : String;
private var used_variables : Array = new Array();
private var visualizing_script : boolean = false;
private var used_variable_values : Array = new Array();

private var puzzle_base : PuzzleBase;

// visualize line pointer
var line_pointer : GameObject;
var pointer_start_loc : Vector2;
private var curr_pointer_pos : int = 0;
private var pointer_line_spacing : float = 0.19;

// Defines the type of variable to check
var check_type_int : boolean = false;
var check_type_float : boolean = false;
var check_type_bool : boolean = false;
var check_type_str : boolean = false;

// Custom editable variables
//var use_custom_variable : boolean;
var target_variable_name : String;
var target_variable_value_int : int;
var target_variable_value_float : float;
var target_variable_value_bool : boolean;
var target_variable_value_str : String;

var target_variable_result;

var variables_txt : GameObject = null;
var player_code_txt : GameObject = null;
var base_expression : String = "";
var test_var : int = 0;
var update_variable : String = "a";

// Victory condition
var correct_move_distance : int = 0;

// Movement variables
var move_distance : int = 100;
var move_direction : int = 0;

// Local Scopes
var visualize_scope : ScriptScope;
var test_script_scope : ScriptScope;
var successful_script_run : boolean;

function Start () 
{
	// Initialize Local Scope
	visualize_scope = Framework.python_engine.CreateScope();
	test_script_scope = Framework.python_engine.CreateScope();

	puzzle_base = GetComponent.<PuzzleBase>();

	// Set up the trace to find the line number being executed
	//Framework.python_engine.SetTrace(trace_back);

	// set up base expression
	if (base_expression != null)
		base_expression = base_expression.Replace("\\n", "\n");
		var source_s = Framework.python_engine.CreateScriptSourceFromString(base_expression);
		source_s.Execute(visualize_scope);

	// Initialize Python Thread
	//python_thread = new Thread(run_script);
	//python_thread.Start();

	// Initialize variable finder script
	find_variables = "\n\n_keywords = vars()\n_keywords_user = _keywords.copy()\n_var_bank = []\nfor _key in _keywords_user:\n	if _key[0] != '_' and _key != 'time':\n		_var_bank.append(_key)";

	// get pointer start location
	pointer_start_loc = line_pointer.transform.position;
}

function Update()
{
	if (visualizing_script)
	{
		if (visualize_scope.ContainsVariable("_line_num"))
		{
			curr_exe_line_no = visualize_scope.GetVariable.<int>("_line_num");
			// if (curr_exe_line_no == 10)
			// {
			// 	var obj_class = visualize_scope.GetVariable("obj_0");
			// 	Framework.python_engine.Operations.InvokeMember(obj_class, "update_pos", 10909, 987);
			// 	Debug.Log(Framework.python_engine.Operations.GetMember.<float>(obj_class, "x"));
			// }

			if (curr_exe_line_no != curr_pointer_pos)
				align_pointer(curr_exe_line_no);
		}
		
		var updated_var_txt : String = get_used_variable_txt();
		variables_txt.GetComponent.<Text>().text = updated_var_txt;
		
		// check if script execution thread created
		if (python_thread != null)
		{
			// check if thread is active
			if (!python_thread.IsAlive)
			{
				// script has finished, check for success
				visualizer_check_for_success();
				
				//puzzle_base.check_for_success();
				visualizing_script = false;
			}
		}
	}
}

//
//
function visualizer_check_for_success()
{
	var check_variable = visualize_scope.GetVariable(target_variable_name);

	if (check_type_int)
	{
		if (target_variable_value_int == check_variable)
		{
			successful_script_run = true;
		}
	} else if (check_type_float)
	{
		if (target_variable_value_float == check_variable)
		{
			successful_script_run = true;
		}
	} else if (check_type_bool)
	{
		if (target_variable_value_bool == check_variable)
		{
			successful_script_run = true;
		}
	} else if (check_type_str)
	{
		if (target_variable_value_str == check_variable)
		{
			successful_script_run = true;
		}
	}

	puzzle_base.check_for_success(null);
}


// Pre:  None
// Post: Executes the code and reassigns the editable variables to the values 
//		 created by the player's code.
function execute_code(player_code) 
{
	successful_script_run = false;
	code = player_code;
	player_code_txt.GetComponent.<Text>().text = code;
	test_code = code + find_variables;
	//visualizing_script = true;
	// start python thread

	if (python_thread == null || !python_thread.IsAlive)
		python_thread = new Thread(run_script);
		python_thread.Start();
	
	
}

function run_script()
{
	// get variables used
	var source_code_t = Framework.python_engine.CreateScriptSourceFromString(test_code);
	source_code_t.Execute(test_script_scope);
	used_variables = test_script_scope.GetVariable.<Array>("_var_bank");
	create_used_variable_array();
	visualizing_script = true;

	// execute code
	// add_visual_helpers();
	// var source_code_v = Framework.python_engine.CreateScriptSourceFromString(edited_code);
	// source_code_v.Execute(visualize_scope);
	var visualize_script : String = rebuild_script();
	var source_code_v = Framework.python_engine.CreateScriptSourceFromString(visualize_script);
	source_code_v.Execute(visualize_scope);

	Debug.Log("script done");
	// visualizing_script = false;
	python_thread.Sleep(0);
	python_thread.Abort();

}

function add_visual_helpers()
{
	var lines : Array = new Array(code.Split("\n"[0]));

	var curr_line : int = 0;
	edited_code= "";
	
	for (var i : int = 0; i < lines.length * 2; i++)
	{
		if (i % 2 == 0)
		{
			edited_code += "\n" + lines[i / 2] + "\n";
		} else {
			var line_tabs : String = find_tabs(lines[(i - 1) / 2]);
			edited_code += line_tabs + "_line_num = " + curr_line.ToString();

			if (!is_blank_line(lines[(i - 1) / 2]))
				edited_code += "\n" + line_tabs + "time.sleep(2)";

			curr_line += 1;
		}
	}

	Debug.Log(edited_code);
	
}

//
//
function rebuild_script()
{
	var original_lines : Array = new Array(code.Split("\n"[0]));
	var visualize_code : String = "";
	var carried_line : boolean = false;
	var line_id_str : String = "_line_num = ";
	var line_id : int = 0;
	var sleep_str : String = "time.sleep(2)";

	for (var curr_line : String in original_lines)
	{
		var line_is_blank = is_blank_line(curr_line);
		var curr_line_tabs = find_tabs(curr_line);

		if (carried_line)
		{
			if (":" in curr_line)
			{
				carried_line = false;
				visualize_code += curr_line + "\n";
				visualize_code += curr_line_tabs + line_id_str + line_id.ToString() + "\n";
				visualize_code += curr_line_tabs + sleep_str + "\n";
			} else {
				visualize_code += curr_line + "\n";
			}
		} else if ("for " in curr_line || "while " in curr_line || "if " in curr_line || 
					"else " in curr_line || "else:" in curr_line || "elif " in curr_line || 
					"def " in curr_line || "class " in curr_line)
		{
			if (":" in curr_line)
			{
				visualize_code += curr_line + "\n";
				visualize_code += curr_line_tabs + "	" + line_id_str + line_id.ToString() + "\n";
				visualize_code += curr_line_tabs + "	" + sleep_str + "\n";

			} else {
				carried_line = true;
				visualize_code += curr_line + "\n";
			}
		} else {
			visualize_code += curr_line + "\n";
			visualize_code += curr_line_tabs + line_id_str + line_id.ToString() + "\n";

			if (!line_is_blank)
				visualize_code += curr_line_tabs + sleep_str + "\n";			
		}

		line_id++;
	}
	Debug.Log(visualize_code);
	return visualize_code;
}

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

		// if ("for " in code_line || "while " in code_line || "if " in code_line || "else:" in code_line || "else " in code_line || "def " in code_line)
		// {
		// 	str_tabs += "	";
		// }

	}
	
	return str_tabs;
}

function is_blank_line(code_line : String) : boolean
{
	var is_blank = false;

	// if (code_line != "" && code_line != "\n")
	// {
	// 	for (var character : char in code_line)
	// 	{
	// 		if (character != "	" && character != " " && character != "\n")
	// 			is_blank = false;
	// 	}
	// }

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
	var display_txt : String = "";
	
	for (var i : int = 0; i < used_variables.length; i++)
	{
		if (visualize_scope.ContainsVariable(used_variables[i]))
		{
			display_txt += used_variables[i].ToString() + " = " + visualize_scope.GetVariable(used_variables[i]).ToString() + "\n";
		}
	}


	// if (visualize_scope.ContainsVariable("_line_num"))
	// 	curr_exe_line_no = visualize_scope.GetVariable.<int>("_line_num");
	return display_txt;
}

function align_pointer(new_pos : int)
{
	var new_pointer_location : Vector2 = pointer_start_loc - new Vector2(0, new_pos * pointer_line_spacing);
	line_pointer.transform.position = new_pointer_location;
	curr_pointer_pos = new_pos;
}