#pragma strict

//var puzzle_controller : GameObject;
private var puzzle_base : PuzzleBase;
private var blocked_tags : Array = new Array();
//private var hack_display : GameObject;

function Start()
{
	//puzzle_base = puzzle_controller.GetComponent.<PuzzleBase>();
	//hack_display = transform.Find("hack_display").gameObject;
	//hack_display.SetActive(false);
	blocked_tags.Add("puzzle_object");
	blocked_tags.Add("platform");

}

// function OnTriggerEnter2D(obj_collider : Collider2D)
// {
// 	if (obj_collider.gameObject.tag in blocked_tags)
// 	{
// 		obj_collider.gameObject.GetComponent.<Editable>().cancel_all_moves();
// 	}
// }

//
//
function show_hack_data()
{
	//hack_display.SetActive(true);
}

//
//
function hide_hack_data()
{
	//hack_display.SetActive(false);
}