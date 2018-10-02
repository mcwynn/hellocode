#pragma strict

private var puzzle_base : PuzzleBase;

// Local Scope
private var python_local_scope : ScriptScope;

private var input_base_code : String = "";

private var decryption_key;
var decryption_key_name : String;

function Start () 
{
	// Initialize Local Scope
	python_local_scope = Framework.python_engine.CreateScope();

	puzzle_base = GetComponent.<PuzzleBase>();
}

//--------------------
// Helper Functions
//--------------------

// Pre:  None
// Post: Executes the code and reassigns the editable variables to the values 
//		 created by the player's code.
function execute_code(player_code)
{
	// get input base code
	input_base_code = puzzle_base.puzzle_base_code;
	
	var exe_code : String = input_base_code + player_code;

	// execute code
	var source_code = Framework.python_engine.CreateScriptSourceFromString(exe_code);
	source_code.Execute(python_local_scope);

	if (puzzle_base.victory_condition_int)
	{
		decryption_key = python_local_scope.GetVariable.<int>(decryption_key_name);

	} else if (puzzle_base.victory_condition_float)
	{
		decryption_key = python_local_scope.GetVariable.<float>(decryption_key_name);

	} else if (puzzle_base.victory_condition_str)
	{
		decryption_key = python_local_scope.GetVariable.<String>(decryption_key_name);
	}

	Debug.Log(decryption_key);

	victory_check();
	
	
}

function victory_check()
{
	var correct_solution = false;

	if (puzzle_base.victory_condition_int)
	{
		correct_solution = puzzle_base.victory_check_int(decryption_key);

	} else if (puzzle_base.victory_condition_float)
	{
		correct_solution = puzzle_base.victory_check_float(decryption_key);

	} else if (puzzle_base.victory_condition_str)
	{
		correct_solution = puzzle_base.victory_check_str(decryption_key);
	}

	if (correct_solution)
		success();
	
	
}

//
//
function success()
{
	Debug.Log("success");
}