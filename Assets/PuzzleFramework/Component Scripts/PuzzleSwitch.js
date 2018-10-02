#pragma strict

// puzzle base script reference
private var puzzle_base : PuzzleBase;

// switches
var switches_in_puzzle : Array = new Array();

// possible reactions to switches
var moves_obj : boolean = false;
var updates_text : boolean = false;
var has_queue : boolean = false;

// changeable objects
var moveable_obj : GameObject;
var text_obj_0 : GameObject = null;
var text_obj_1 : GameObject = null;
var text_obj_2 : GameObject = null;
var text_obj_3 : GameObject = null;
var text_obj_4 : GameObject = null;
var text_obj_5 : GameObject = null;
private var text_objs : Array = new Array();
var queue_obj : GameObject;

// switch options
var number_of_switches : int = 0;
var number_of_variables : int = 0;
var variable_to_update_0 : String = null;
var variable_to_update_1 : String = null;
var variable_to_update_2 : String = null;
var variable_to_update_3 : String = null;
var variable_to_update_4 : String = null;
var variable_to_update_5 : String = null;
var base_expression : String = "";
private var update_variables : Array = new Array();

// puzzle variables
private var curr_stage : int = 0;
private var curr_txt_obj : GameObject;
private var new_variable;

// Local Scope
var python_local_scope : ScriptScope;

function Start () 
{
	puzzle_base = GetComponent.<PuzzleBase>();

	// Initialize Local Scope
	python_local_scope = Framework.python_engine.CreateScope();

	// set up list of variable names
	if (variable_to_update_0 != null)
		update_variables.Add(variable_to_update_0);
	if (variable_to_update_1 != null)
		update_variables.Add(variable_to_update_1);
	if (variable_to_update_2 != null)
		update_variables.Add(variable_to_update_2);
	if (variable_to_update_3 != null)
	 	update_variables.Add(variable_to_update_3);

	// set up list of text objects
	if (text_obj_0 != null)
		text_objs.Add(text_obj_0);
	if (text_obj_1 != null)
		text_objs.Add(text_obj_1);
	if (text_obj_2 != null)
		text_objs.Add(text_obj_2);
	if (text_obj_3 != null)
		text_objs.Add(text_obj_3);

	// set up base expression
	if (base_expression != null)
		base_expression = base_expression.Replace("\\n", "\n");
		Debug.Log(base_expression);
		var source_s = Framework.python_engine.CreateScriptSourceFromString(base_expression);
		source_s.Execute(python_local_scope);
}

//--------------------
// Helper Functions
//--------------------

function activate_switch(activated_switch : GameObject, switch_number : int) 
{
	if (switch_number == curr_stage)
	{
		if (switch_number == (number_of_switches - 1))
		{
			execute_switch(activated_switch);
			puzzle_base.trigger_complete();
			puzzle_base.sfx_play_success();
			
		} else {
			curr_stage++;

			if (moves_obj)
			{

			} else if (updates_text)
			{
				if (!has_queue)
				{
					execute_switch(activated_switch);
				}
			}
		}

	} else {
		for (var j : int = 0; j < number_of_switches; j++)
		{
			var switch_obj : GameObject = switches_in_puzzle[j] as GameObject;
			switch_obj.GetComponent.<ObjectSwitch>().reset();

			Debug.Log(switch_obj);
		}

		puzzle_base.sfx_play_error();
		curr_stage = 0;
		reset_variables();
	}
}

function execute_switch(activated_switch : GameObject)
{
	var new_expression = activated_switch.GetComponent.<ObjectSwitch>().expression;
	// execute code
	var source_s = Framework.python_engine.CreateScriptSourceFromString(new_expression);
	source_s.Execute(python_local_scope);
	// update text
	for (var i : int = 0; i < number_of_variables; i++)
	{
		new_variable = python_local_scope.GetVariable(update_variables[i]);
		curr_txt_obj = text_objs[i] as GameObject;
		curr_txt_obj.GetComponent.<Text>().text = update_variables[i] + " = " + new_variable.ToString();
	}
}

function reset_variables()
{
	// Reset variables
	var source_s = Framework.python_engine.CreateScriptSourceFromString(base_expression);
	source_s.Execute(python_local_scope);

	for (var i : int = 0; i < number_of_variables; i++)
	{
		new_variable = python_local_scope.GetVariable(update_variables[i]);
		curr_txt_obj = text_objs[i] as GameObject;
		curr_txt_obj.GetComponent.<Text>().text = update_variables[i] + " = " + new_variable.ToString();
	}
}