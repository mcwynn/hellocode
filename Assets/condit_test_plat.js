#pragma strict

import UnityEngine.UI;
import System;
import Compiler;
import Microsoft.Scripting.Hosting;

// EDITABLE variables
var drop : boolean;

// NON-EDITABLE variables
var player_code : String = "";
var update_code : String;
private var x_pos : float;

private var moving : boolean = true;
private var move_dir : int = 1; // 1 = right, -1 = left
private var velocity : float = 1;
private var init_x : float;
private var move_range_x : int = 5;

var key : GameObject;
var target : GameObject;
var target_txt : GameObject;

// Terminal Script reference 
var text_editor_script : text_editor;

// Create scope for object
private var pyScope3 = text_editor_script.pyEngine.CreateScope();


// Base object Python code
// (EDITABLE variables: moving, velocity, move_dir) 
var base_code : String = "drop = False\n";


// UI Info String: Explain to the player what variables are editable
var user_info : String; 
user_info += "Drop = False # Boolean        - If True it will drop the red ball.\n";
user_info += "x            # Floating Point - The current x position of the platform.\n";
user_info += "target_x     # Floating Point - The current x position of the target.\n";


// Execute Base object code
var source2 = text_editor_script.pyEngine.CreateScriptSourceFromString(base_code);
source2.Execute(pyScope3);


function Start() {
	init_x = transform.position.x;
	//renderer = gameObject.GetComponent.<SpriteRenderer>();
}


// Pre :
// Post:
function execute_code() 
{
	// add player code to the end of base code
	var exe_code = base_code + update_code + player_code;
	//Debug.Log(exe_code);
	// execute code


	try {
		var source = text_editor_script.pyEngine.CreateScriptSourceFromString(exe_code);
		//source.Execute(pyScope3);
		//var errors = Microsoft.Scripting.Hosting.ErrorListener();
		//var CompilerParams = Compiler.CompilerParameters();
		var compile = source.Compile();
		//Debug.Log(compile);
		if (compile != null)
		{
			//source.Execute(pyScope3);
    		//Debug.Log("compilation");
    	} else {
    		//Debug.Log("compilation Failed");
    	}

		//if compile.Errors.HasErrors:
        //	raise Exception("Compile error: %r" % list(compile.Errors.List));

	}

	catch (e : System.Exception) {  
    	Debug.LogException(e);
    }

	// reassign editable variables
	drop = pyScope3.GetVariable.<boolean>("drop");

	if (drop)
	{
		key.GetComponent.<key>().is_attached = false;
	}

}


// Main Loop
function Update () 
{
	x_pos = transform.position.x;


	// Base object Python code
	// (Updates x pos) 
	update_code = "x = " + x_pos.ToString() + "\ntarget_x = " + target.transform.position.x.ToString() + "\n";
	execute_code();

	if (moving) 
	{
		transform.position.x += move_dir * velocity * Time.deltaTime;

		if (x_pos >= init_x + move_range_x)
			move_dir = -1;
		if (x_pos <= init_x - move_range_x)
			move_dir = 1;

	}
}

// 
function code_change(code : String) 
{
	//Debug.Log(player_code);
	player_code = code;
	execute_code();
}

//
//
function send_base_code()
{
	target_txt.GetComponent.<Text>().text = user_info;
}