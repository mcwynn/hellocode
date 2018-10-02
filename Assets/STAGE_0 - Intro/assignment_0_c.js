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
var switch_4 : GameObject;

// Sprite references
var ap_on_sprite : Sprite;
var ap_off_sprite : Sprite;

var success : boolean = false;
var fail : boolean = false;
var selected : boolean = false;

private var useable_dist : float = 1.5;
private var nearest_tag : GameObject;
private var dist_from_nearest_tag : float;
private var switch_tag : String = "switch";

var correct_a : int = 18;

// Switch Assignment value
private var solution_a : float = 0;
private var solution_b : float = 0;
private var solution_c : float = 0;
private var queue : Array = new Array();
private var visual_q : Array = new Array();
private var new_item : GameObject;
private var queue_txt : String;

var sleep : int = 120;
var curr_item : int;

private var vq_obj : GameObject;
var vq_0 : GameObject;
var vq_1 : GameObject;
var vq_2 : GameObject;
var vq_3 : GameObject;


private var play_queue : boolean = false;
private var queue_completed : boolean = false;

// Pre : Main loop
// Post: Handles the text box and the visual queue.
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

	if (play_queue && !queue_completed)
	{
		
		if (queue.length > 0)
		{
			if (sleep <= 0)
			{
				curr_item = queue.shift();

				if (curr_item == 0)
				{
					solution_a = solution_a + solution_b;

				} else if (curr_item == 1)
				{
					solution_a = solution_b * solution_c;

				} else if (curr_item == 2)
				{
					solution_b = 3;

				} else
				{
					solution_c = solution_b + 2;

				}

				var remove_item = visual_q.shift();
				Destroy(remove_item, 0.0f);
				assignment_txt.GetComponent.<Text>().text = ("a = " + solution_a.ToString() + "    " +
															 "b = " + solution_b.ToString() + "    " +
															 "c = " + solution_c.ToString());
				sleep = 120;

			} else {
				sleep -= 1 * Time.deltaTime;
			}
		} else
		{
			queue_completed = true;
			victory_check();
		}
	}
}


// Pre : Should be run after all the switches are pulled.
// Post: Checks the solution, opens the door if correct, resets otherwise.
function victory_check()
{
	if (solution_a == correct_a)
	{
		Debug.Log("Success!");
		puzzle_door.SendMessage("Open", SendMessageOptions.DontRequireReceiver);

	} else{
		Debug.Log("Fail!");
		switch_0.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		switch_1.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		switch_2.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		switch_3.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		switch_4.SendMessage("Reset", SendMessageOptions.DontRequireReceiver);
		solution_a = 0;
		solution_b = 0;
		solution_c = 0;
		queue_completed = false;
		play_queue = false;

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
// Post: Selects the object.
function Deselected()
{
	GetComponent.<SpriteRenderer>().sprite = ap_off_sprite;
	selected = false;
}

// Pre:  None
// Post: Selects or Deselects the object.
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
// Post: activates the switch, adds the switch's expression to the visual queue.
function switch_activated(switch_number : int)
{
	if (switch_number >= 0 && switch_number < 4)
	{
		if (switch_number == 0)
		{
			vq_obj = vq_0;

		} else if (switch_number == 1)
		{
			vq_obj = vq_1;

		} else if (switch_number == 2)
		{
			vq_obj = vq_2;

		} else
		{
			vq_obj = vq_3;
		}

		queue.push(switch_number);

		// first addition to the queue
		if (queue.length == 0)
		{
			new_item = Instantiate(vq_obj, new Vector2(transform.localPosition.x + 5, transform.localPosition.y + 4),
						Quaternion.identity);
			visual_q.push(new_item);

		// after the first addition
		} else
		{
			var pos = queue.length * 0.75;
			new_item = Instantiate(vq_obj, new Vector2(transform.localPosition.x + 5, transform.localPosition.y + 4 - pos),
						Quaternion.identity);
			visual_q.push(new_item);
		}

	} else
	{
		play_queue = true;

	}
}


//function add_to_queue(item : int)
//{
//	queue.push(item);

//}

//function run_queue(item : int)
//{



//}