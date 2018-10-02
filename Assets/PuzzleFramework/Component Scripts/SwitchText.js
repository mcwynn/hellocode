#pragma strict

private var switch_text : String;

function Start () 
{
	switch_text = transform.parent.parent.GetComponent.<ObjectSwitch>().text_above_switch;
	GetComponent.<Text>().text = switch_text;
}