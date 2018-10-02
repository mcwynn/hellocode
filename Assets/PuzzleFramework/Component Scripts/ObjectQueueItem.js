#pragma strict

private var queue_controller : PuzzleQueue;
var switch_number : int;
var expression : String;

function Start () 
{
	queue_controller = transform.parent.GetComponent.<PuzzleQueue>();
}

function Update () {

}