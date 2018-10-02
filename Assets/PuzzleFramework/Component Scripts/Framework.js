#pragma strict

import System.Threading;

public static class Framework extends MonoBehaviour 
{
	// Initialize Python Interpreter
	var python_engine : ScriptEngine = UnityPython.CreateEngine();
	var python_scope : ScriptScope = python_engine.CreateScope();

	// Array of all of the puzzles in the current level
	var puzzles : Array = new Array();

	// Text Editor and UI variables
	var text_editor_active : boolean = false;
	var UI : GameObject;
	var success_message : GameObject;
	var success_message_txt_main : GameObject;

	// Editable Object Variables
	var object_scope : ScriptScope = python_engine.CreateScope();

	var text_editor_panel : GameObject;
	var terminal_target : GameObject; // current target

	// Python script execution threads
	// obj_thread = new Thread(run_object_script);
	// visualizer_thread = new Thread(run_visualizer);

	// Robot Sidekick
	var sidekick_obj : GameObject;
	var sidekick_combat_code : String = "";
	var sidekick_combat_code_base : String = "";
	var sidekick_combat_code_compiled : String = "";
	var sidekick_command_code_base : String = "";
	var sidekick_command_code : String = "";
	var sidekick_explore_code : String = "";

	// Robot Sidekick interpreter variables
	var sidekick_combat_scope : ScriptScope = python_engine.CreateScope();
	var sidekick_command_scope : ScriptScope = python_engine.CreateScope();
	var source_s : ScriptSource;

	// Robot Sidekick States
	var curr_attacking_state : boolean = false;
	var last_attacking_state : boolean = false;
	var curr_atk_move_state : boolean = false;
	var last_atk_move_state : boolean = false;
	var curr_follow_state : boolean = false;
	var last_follow_state : boolean = false;

	// Initialization
	// Pre: 
	// Post:
	function initialize_framework()
	{
		sidekick_obj = GameObject.FindGameObjectWithTag("sidekick");

		sidekick_combat_code_base =  "# Combat Code Base Functions:\n";
		sidekick_combat_code_base += "# These are needed for the player's code to function\n";
		// sidekick_combat_code_base += "class Sidekick:\n";
		// sidekick_combat_code_base += "	def __init__(self):\n";
		// sidekick_combat_code_base += "		self.attacking = False\n";
		// sidekick_combat_code_base += "		self.moving_towards_enemy = False\n";
		// sidekick_combat_code_base += "		self.following_player = False\n";
		sidekick_combat_code_base += "attacking = False\n";
		sidekick_combat_code_base += "moving_towards_enemy = False\n";
		sidekick_combat_code_base += "following_player = False\n";
		
		//sidekick_combat_code_base += "rs = Sidekick()\n";
		sidekick_combat_code_base += "def attack():\n";
		sidekick_combat_code_base += "	global attacking\n";
		sidekick_combat_code_base += "	attacking = True\n";
		sidekick_combat_code_base += "def move_towards_enemy():\n";
		sidekick_combat_code_base += "	global moving_towards_enemy\n";
		sidekick_combat_code_base += "	moving_towards_enemy = True\n";
		sidekick_combat_code_base += "def follow_me():\n";
		sidekick_combat_code_base += "	global following_player\n\n";
		sidekick_combat_code_base += "	following_player = True\n\n";


		// Initialize Sidekick command mode base code
		sidekick_command_code_base = "orders = []\n";
		sidekick_command_code_base += "def move_right():\n";
		sidekick_command_code_base += "	orders.append('right')\n";
		sidekick_command_code_base += "def move_left():\n";
		sidekick_command_code_base += "	orders.append('left')\n";
		sidekick_command_code_base += "def move_up():\n";
		sidekick_command_code_base += "	orders.append('up')\n";
		sidekick_command_code_base += "def move_down():\n";
		sidekick_command_code_base += "	orders.append('down')\n";
		sidekick_command_code_base += "def use_object():\n";
		sidekick_command_code_base += "	orders.append('use')\n\n";

		// executes the combat base code
		source_s = python_engine.CreateScriptSourceFromString(sidekick_combat_code_base);
		source_s.Execute(sidekick_combat_scope);

		// executes the command base code
		source_s = python_engine.CreateScriptSourceFromString(sidekick_command_code_base);
		source_s.Execute(sidekick_command_scope);

		text_editor_panel = GameObject.Find("TextEditor");

		// test player code
		var p_code : String = "move_right()\n";
		p_code += "move_right()\n";
		p_code += "move_right()\n";
		// p_code += "move_left()\n";
		// p_code += "move_up()\n";
		p_code += "use_object()\n";
		sidekick_command_code = p_code;
	}

	// --------------------------------------------------
	// Handle Puzzle Code Execution 
	// --------------------------------------------------
	

	// Pre:  
	// Post: 
	public function execute_editor_code(editor_code : String)
	{
		// send the code to the current target object
		terminal_target.GetComponent.<PuzzleBase>().activate_puzzle(editor_code);
	}

	// Pre: 
	// Post:
	public function assign_terminal_target(target_obj : GameObject)
	{
		if (terminal_target != null && terminal_target != target_obj)
			terminal_target.GetComponent.<PuzzleBase>().Deselected();
		terminal_target = target_obj;
	}

	// Pre: 
	// Post:
	public function reset_terminal_target()
	{
		terminal_target = null;
	}

	//
	//
	function reset_targeted_puzzle()
	{
		if (terminal_target != null)
		{
			terminal_target.GetComponent.<PuzzleBase>().reset();
			text_editor_panel.GetComponent.<ScriptExecution>().reset();
		}
	}

	//
	//
	function reset_level_data()
	{
		puzzles = new Array();
		text_editor_active = false;
		terminal_target = null;
	}

	//
	//
	function show_success_message()
	{
		success_message_txt_main.GetComponent.<Text>().text = "Success!";
		success_message.SetActive(true);
	}

	//
	//
	function show_fail_message()
	{
		success_message_txt_main.GetComponent.<Text>().text = "Fail!";
		success_message.SetActive(true);
	}

	//
	//
	function hide_success_message()
	{
		success_message.SetActive(false);
	}


	// --------------------------------------------------
	// Handle Player Function Abilities 
	// --------------------------------------------------

	public var function_gun_code : String = "";
	var ret_data;
	var obj_hit_by_f_gun : GameObject;

	// Pre:  Needs the data from the robot as an array, and the function name as a string.
	// Post: Runs the input data through the player's function, returns the new data.
	public function call_function_gun (input_data : Array, function_name : String, 
									   num_parameters : int, object_hit : GameObject)
	{
		//var new_data : float = 0;
		obj_hit_by_f_gun = object_hit;

		if (function_gun_code.Contains("def " + function_name))
		{
			var code : String = function_gun_code + "\n\n";

			if (num_parameters == 0)
			{
				code += "return_val = " + function_name + "()";

			} else if (num_parameters == 1)
			{
				code += "input_data = " + input_data + "\n";
				code += "return_val = " + function_name + "(input_data)";

			} else if (num_parameters == 2)
			{
				code += "input_data_a = " + input_data[0] + "\n";
				code += "input_data_b = " + input_data[1] + "\n";
				code += "return_val = " + function_name + "(input_data_a, input_data_b)";

			} else if (num_parameters == 3)
			{
				code += "input_data_a = " + input_data[0] + "\n";
				code += "input_data_b = " + input_data[1] + "\n";
				code += "input_data_c = " + input_data[2] + "\n";
				code += "return_val = " + function_name + "(input_data_a, input_data_b, input_data_c)";
			}
				
			Debug.Log("pre ran code");
			// executes the code
			text_editor_panel.GetComponent.<ScriptExecution>().execute_code(code, false);
			// var source_f = python_engine.CreateScriptSourceFromString(code);
			// source_f.Execute(python_scope);
			Debug.Log("ran code");


			// grabs the return value
			//ret_data = python_scope.GetVariable("return_val");
		} else {
			return_function_gun_data(null);
		}
		

		//return ret_data;
	}

	function return_function_gun_data(return_data)
	{
		obj_hit_by_f_gun.GetComponent.<enemy_hackable>().check_return_data(return_data);
	}

	// Pre: 
	// Post:
	public function object_hacked(hacked_object : GameObject)
	{
		hacked_object.SendMessage("hacked");
	}

	// --------------------------------------------------
	// Handle Robot Sidekick Code
	// --------------------------------------------------

	// Pre: 
	// Post:
	public function upload_sidekick_combat_code(player_combat_code : String)
	{
		sidekick_combat_code = player_combat_code;
		//source_s = python_engine.CreateScriptSourceFromString(sidekick_combat_code);
		//sidekick_combat_code_compiled = source_u.Compile();
	}

	// Pre: 
	// Post:
	public function upload_sidekick_command_code(player_command_code : String)
	{
		sidekick_command_code = player_command_code;
	}

	// Pre: 
	// Post:
	function run_combat_code(distance_from_enemy : float)
	{
		var curr_combat_code = sidekick_combat_code_base + "distance_from_enemy = " + 
							   distance_from_enemy.ToString() + "\n" + sidekick_combat_code;

		// executes the code
		source_s = python_engine.CreateScriptSourceFromString(curr_combat_code);
		source_s.Execute(sidekick_combat_scope);

		// grab variables to check for state changes
		curr_attacking_state = sidekick_combat_scope.GetVariable.<boolean>("attacking");
		curr_atk_move_state = sidekick_combat_scope.GetVariable.<boolean>("moving_towards_enemy");
		curr_follow_state = sidekick_combat_scope.GetVariable.<boolean>("following_player");
		

		if (curr_attacking_state)
		{
			sidekick_obj.GetComponent.<robot_sidekick>().start_attacking();


		} else if (curr_atk_move_state)
		{
			sidekick_obj.GetComponent.<robot_sidekick>().move_towards_enemy();


		} else if (curr_follow_state)
		{
			sidekick_obj.GetComponent.<robot_sidekick>().follow_player();
		}
	}

	// Pre: 
	// Post:
	function run_command_code() : Array
	{
		var curr_command_code = sidekick_command_code_base + sidekick_command_code;

		// executes the code
		source_s = python_engine.CreateScriptSourceFromString(curr_command_code);
		source_s.Execute(sidekick_command_scope);

		var commands : Array = sidekick_command_scope.GetVariable.<Array>("orders");
		//sidekick_obj.GetComponent.<robot_sidekick>().command_queue = commands;

		return commands;
	}

}