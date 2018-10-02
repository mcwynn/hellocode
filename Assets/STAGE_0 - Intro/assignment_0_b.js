#pragma strict

import UnityEngine.UI;

// GameObject references
var text_editor : GameObject;
var player : GameObject;

var target : GameObject;
var target_txt : GameObject;
var puzzle_description : GameObject;
var puzzle_desc_box : Canvas;
var assignment_txt : GameObject;

var puzzle_door : GameObject;
var switch_0 : GameObject;
var switch_1 : GameObject;
var switch_2 : GameObject;
var switch_3 : GameObject;

// Sprite references
var ap_on_sprite : Sprite;
var ap_off_sprite : Sprite;

var success : boolean = false;
var fail : boolean = false;
var selected : boolean = false;
var use_type : String = "controller";

private var useable_dist : float = 1.5;
private var nearest_tag : GameObject;
private var dist_from_nearest_tag : float;
private var switch_tag : String = "switch";

var correct_solution : int = 21;
var switches_pulled : int = 0;
var total_num_switches : int = 4;

// Switch Assignment value
private var solution : float = 0;


// Pre : Main loop
// Post: Handles the text box upon selection and deselection
function Update()
{
	if (selected)
	{
		if (puzzle_desc_box.enabled == false)
		{
			puzzle_desc_box.enabled = true;
		}
	} else if (puzzle_desc_box.enabled == true) 
	{
		puzzle_desc_box.enabled = false;
	}
}


// Pre : Should be run after all switches are pulled.
// Post: Checks the solution, opens the door if correct, resets otherwise.
function victory_check()
{
	if (solution == correct_solution)
	{
		Debug.Log("Success!");
		puzzle_door.SendMessage("Open", SendMessageOptions.DontRequireReceiver);

	} else {
		Debug.Log("Fail!");
		switch_0.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		switch_1.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		switch_2.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		switch_3.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		switches_pulled = 0;
		
	}
}

// Pre : None
// Post: Selects the object.
function Selected()
{
	GetComponent.<SpriteRenderer>().sprite = ap_on_sprite;
	selected = true;
}

// Pre : None
// Post: Deselects the object.
function Deselected()
{
	GetComponent.<SpriteRenderer>().sprite = ap_off_sprite;
	selected = false;
}

// Pre:  None
// Post: Selects or deselects the object.
function use_object()
{
	if (selected)
	{
		Deselected();
	} else {
		Selected();
	}
}

// Pre:  Needs the pulled switches order/number.
// Post: activates the switch, adds the switch's expression to the solution.
function switch_activated(switch_number : int)
{
	if (switch_number == 0)
	{
		solution = solution * 2;
		assignment_txt.GetComponent.<Text>().text = "a = " + solution.ToString();
		switches_pulled++;

	} else if (switch_number == 1)
	{
		solution = solution + 7.5;
		assignment_txt.GetComponent.<Text>().text = "a = " + solution.ToString();
		switches_pulled++;

	} else if (switch_number == 2)
	{
		solution = 1;
		assignment_txt.GetComponent.<Text>().text = "a = " + solution.ToString();
		switches_pulled++;

	} else
	{
		solution = solution + 4;
		assignment_txt.GetComponent.<Text>().text = "a = " + solution.ToString();
		switches_pulled++;

	}

	if (switches_pulled == total_num_switches)
	{
		victory_check();
	}
}