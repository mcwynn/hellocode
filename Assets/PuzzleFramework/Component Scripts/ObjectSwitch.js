#pragma strict

private var switch_controller : PuzzleSwitch;
var switch_number : int;
var expression : String;
var text_above_switch : String;

private var switched_on : boolean = false;
var spr_switch_down : Sprite;
var spr_switch_up : Sprite;

function Awake () 
{
	text_above_switch = text_above_switch.Replace("\\n", "\n");
	expression = expression.Replace("\\n", "\n");
	switch_controller = transform.parent.GetComponent.<PuzzleSwitch>();
	switch_controller.switches_in_puzzle.Add(this.gameObject);
}

function use_object()
{
	switched_on = true;
	GetComponent.<SpriteRenderer>().sprite = spr_switch_down;
	switch_controller.activate_switch(this.gameObject, switch_number);
}

function reset()
{
	switched_on = false;
	GetComponent.<SpriteRenderer>().sprite = spr_switch_up;
}