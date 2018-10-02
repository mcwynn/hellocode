#pragma strict

var puzzle_controller : GameObject;
private var puzzle_base : PuzzleBase;
private var hack_display : GameObject;
private var target_obj_name : String;
var target_obj_name_text_obj : GameObject;
var target_obj_name_text_stroke : GameObject;

function Start()
{
	puzzle_base = puzzle_controller.GetComponent.<PuzzleBase>();
	hack_display = transform.Find("hack_display").gameObject;
	hack_display.SetActive(false);
}

function OnTriggerEnter2D(obj_collider : Collider2D)
{
	if (obj_collider.gameObject == puzzle_base.victory_target_obj)
	{
		puzzle_base.successful_attempt = true;

	} else if (obj_collider.gameObject.tag == "player")
	{
		puzzle_base.player_inside_success_trig = true;
	}
}

function OnTriggerExit2D(obj_collider : Collider2D)
{
	if (obj_collider.gameObject == puzzle_base.victory_target_obj)
	{
		puzzle_base.successful_attempt = false;

	} else if (obj_collider.gameObject.tag == "player")
	{
		puzzle_base.player_inside_success_trig = false;
	}
}

//
//
function set_target_obj_name(display_name : String)
{
	target_obj_name = display_name;
	target_obj_name_text_obj.GetComponent.<Text>().text = target_obj_name;
	target_obj_name_text_stroke.GetComponent.<Text>().text = target_obj_name;
}

//
//
function show_hack_data()
{
	hack_display.SetActive(true);
}

//
//
function hide_hack_data()
{
	hack_display.SetActive(false);
}