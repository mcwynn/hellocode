#pragma strict

var power_supply : float = 100; // as percent, in range[0, 100]

private var editable_base_script : Editable;
private var original_pos : Vector2;
private var original_power : float;

function Start() 
{
	editable_base_script = GetComponent.<Editable>();
	original_pos = transform.position;
	original_power = power_supply;
}

function Update () 
{

}

function not_enough_power_for_action()
{
	// player ran out of power, cancel the rest of the script run and fail the puzzle attempt
}

function reset()
{
	transform.position = original_pos;
	power_supply = original_power;
}