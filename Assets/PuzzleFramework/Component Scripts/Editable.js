#pragma strict

// Local Scope
var local_scope : ScriptScope;
private var script_source : ScriptSource;

private var editable_class_base : String = "";
private var update_code : String = "";

var uses_energy : boolean = true;
var energy_level : float = 100;
private var original_energy : float;

// Solution Types
var is_simple_run : boolean = true;
var is_complex_run : boolean = false;

// Object Types
var type_platform : boolean = false;
var type_fan : boolean = false;
var type_point : boolean = false;
var type_box : boolean = false;
var type_capacitor : boolean = false;

// hack display position
var hack_displayed_on_left : boolean = true;
var hack_displayed_on_top : boolean = false;
var hack_displayed_on_bot : boolean = false;

// hack display
var hack_display_name : String = "";
var hack_display_left_obj : GameObject;
var hack_display_top_obj : GameObject;
var hack_display_bot_obj : GameObject;
private var hack_info_displayed : boolean = false;
var hack_display : GameObject;
var hack_x : GameObject;
var hack_y : GameObject;
var methods_display_txt : String;
//var hack_methods : GameObject;


// Object type classes
var type_platform_class_file : TextAsset;
var type_fan_class_file : TextAsset;
var type_point_class_file : TextAsset;
var type_box_class_file : TextAsset;
var type_capacitor_class_file : TextAsset;

private var started : int = 0;
private var start_point : Vector2;
private var end_point : Vector2;
private var facing_dir : int = 1;
private var pos_x : float;
private var pos_y : float;
private var PPU : float = 100;

// reset variables
private var r_activated : boolean;
private var r_move_dir : int;
private var r_velocity : float;
private var r_range : float;

var puzzle_object_handler : PuzzleObjectHandler;

function Awake () 
{
	// Initialize Local Scope
	local_scope = Framework.python_engine.CreateScope();
	initialize_base_code();
	original_energy = energy_level;	
}

function Start()
{
	create_hack_display_txt();
	//hack_obj_name.GetComponent.<Text>().text = hack_display_name;
}

function Update()
{
	if (hack_info_displayed)
	{
		// pos_x = transform.position.x * PPU;
		// pos_y = transform.position.y * PPU;
		// hack_x.GetComponent.<Text>().text = "x = " + pos_x.ToString();
		// hack_y.GetComponent.<Text>().text = "y = " + pos_y.ToString();

		if (uses_energy)
			hack_display.GetComponent.<HackDisplay>().energy_level = energy_level;
	}
}

function get_object_code()
{
	var curr_python_object = local_scope.GetVariable("object");
	return curr_python_object;
}

// function get_var_array() : Array
// {
// 	var variables : Array = new Array();

// 	variables.Add(curr_x);
// 	variables.Add(curr_y);
// 	return variables;
// }

function update_object_code(updated_python_obj)
{
	// local_scope.SetVariable("object", "None");

	// var new_obj_code : String = "object = None";

	// script_source = Framework.python_engine.CreateScriptSourceFromString(new_obj_code);
	// script_source.Execute(local_scope);




	// local_scope.SetVariable("object", updated_python_obj);
	// local_scope.SetVariable("object.x", transform.position.x);
	// local_scope.SetVariable("object.y", transform.position.y);

	// var new_x : float = local_scope.GetVariable("object.x");
	// var new_y : float = local_scope.GetVariable("object.y");
	// Debug.Log(new_x);
	Debug.Log("Updated!");
}



// //
// //
// function reset()
// {
// 	transform.position = start_point;
// 	initialize_base_code();

// 	activated = r_activated;
// 	move_dir = r_move_dir;
// 	velocity = r_velocity;
// 	range = r_range;
// }

//
//
function activate()
{
	// if (is_simple_run)
	// {
	// 	if (move_dir == 0)
	// 	{
	// 		end_point = start_point + new Vector2(range / 100, 0);
	// 	} else {
	// 		end_point = start_point + new Vector2(0, range / 100);
	// 	}
	// } else if (is_complex_run)
	// {
	// 	activated = true;
	// }
	
	// Debug.Log(activated);
}

//
//
function cancel_all_moves()
{
	if (type_platform)
		GetComponent.<Platform>().cancel_moves = true;
	else if (type_box)
		GetComponent.<Box>().cancel_moves = true;
}

//
//
function initialize_base_code()
{
	// Get the python class based on the type of object
	if (type_platform)
		editable_class_base = type_platform_class_file.text;
	else if (type_fan)
		editable_class_base = type_fan_class_file.text;
	else if (type_point)
		editable_class_base = type_point_class_file.text;
	else if (type_box)
		editable_class_base = type_box_class_file.text;
	else if (type_capacitor)
		editable_class_base = type_capacitor_class_file.text;
	
	script_source = Framework.python_engine.CreateScriptSourceFromString(editable_class_base);
	script_source.Execute(local_scope);

	var curr_x : float = transform.position.x;
	var curr_y : float = transform.position.y;
	var obj_class = local_scope.GetVariable("object");
	Framework.python_engine.Operations.InvokeMember(obj_class, "update_pos", curr_x, curr_y);

	if (uses_energy)
	{
		Framework.python_engine.Operations.InvokeMember(obj_class, "_set_init_energy", energy_level);
	}
}

//
//
function create_hack_display_txt()
{
	if (type_platform)
	{
		methods_display_txt =  "<color='#f4d69b'>get_x</color>()\n";
		methods_display_txt += "<color='#f4d69b'>get_y</color>()\n";
		methods_display_txt += "<color='#f4d69b'>set_velocity</color>(velocity)\n";
		methods_display_txt += "<color='#bf4747'>move_right</color>(distance)\n";
		methods_display_txt += "<color='#bf4747'>move_left</color>(distance)\n";
		methods_display_txt += "<color='#bf4747'>move_up</color>(distance)\n";
		methods_display_txt += "<color='#bf4747'>move_down</color>(distance)\n";

	} else if (type_point)
	{
		methods_display_txt =  "<color='#f4d69b'>get_x</color>()\n";
		methods_display_txt += "<color='#f4d69b'>get_y</color>()\n";

	} else if (type_box)
	{
		methods_display_txt =  "<color='#f4d69b'>get_x</color>()\n";
		methods_display_txt += "<color='#f4d69b'>get_y</color>()\n";
		methods_display_txt += "<color='#bf4747'>move_right</color>(distance)\n";
		methods_display_txt += "<color='#bf4747'>move_left</color>(distance)\n";

	} else if (type_fan)
	{
		methods_display_txt =  "<color='#f4d69b'>get_x</color>()\n";
		methods_display_txt += "<color='#f4d69b'>get_y</color>()\n";
		methods_display_txt += "<color='#bf4747'>rotate_right</color>(degrees)\n";
		methods_display_txt += "<color='#bf4747'>rotate_left</color>(degrees)\n";
		methods_display_txt += "<color='#bf4747'>increase_speed</color>()\n";
		methods_display_txt += "<color='#bf4747'>decrease_speed</color>()\n";

	} else if (type_capacitor)
	{
		methods_display_txt =  "<color='#f4d69b'>get_x</color>()\n";
		methods_display_txt += "<color='#f4d69b'>get_y</color>()\n";
		methods_display_txt += "<color='#bf4747'>move_right</color>(degrees)\n";
		methods_display_txt += "<color='#bf4747'>move_left</color>(degrees)\n";
		methods_display_txt += "<color='#bf4747'>charge</color>(object, amount)\n";
	}


	//hack_methods.GetComponent.<Text>().text = methods_display_txt;
}

//
//
function show_hack_data()
{
	//hack_display.SetActive(true);
	hack_info_displayed = true;

	if (hack_displayed_on_left)
	{
		hack_display = Instantiate(hack_display_left_obj, transform.position, Quaternion.identity) as GameObject;
		hack_display.GetComponent.<HackDisplay>().assign_text_info(this.gameObject, hack_display_name, methods_display_txt);
	
	} else if (hack_displayed_on_top)
	{
		hack_display = Instantiate(hack_display_top_obj, transform.position, Quaternion.identity) as GameObject;
		hack_display.GetComponent.<HackDisplay>().assign_text_info(this.gameObject, hack_display_name, methods_display_txt);
	
	} else if (hack_displayed_on_bot)
	{
		hack_display = Instantiate(hack_display_bot_obj, transform.position, Quaternion.identity) as GameObject;
		hack_display.GetComponent.<HackDisplay>().assign_text_info(this.gameObject, hack_display_name, methods_display_txt);
	
	}
}

//
//
function hide_hack_data()
{
	//hack_display.SetActive(false);
	hack_info_displayed = false;

	Destroy(hack_display);
}

function update_energy_level(curr_energy_level : float)
{
	energy_level = curr_energy_level;
}

function reset()
{
	energy_level = original_energy;
}