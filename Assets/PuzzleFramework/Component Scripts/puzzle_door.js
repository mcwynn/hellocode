#pragma strict

private var open : boolean = false;
private var open_speed : int = 3;
var open_height : int = 4;
var open_down : boolean = false;
private var open_pos_y : float;

private var animator : Animator;
private var box_col : BoxCollider2D;

function Start()
{
	animator = GetComponent.<Animator>();
	box_col = GetComponent.<BoxCollider2D>();

	/*
	if (!open_down)
		open_pos_y = transform.position.y + open_height;
	else
		open_pos_y = transform.position.y - open_height;
	*/
}

function Update() 
{

	/*
	if (!open_down)
	{
		if (open && transform.position.y < open_pos_y)
		{
			transform.position.y += open_speed * Time.deltaTime;
		}
	} else {
		if (open && transform.position.y > open_pos_y)
		{
			transform.position.y -= open_speed * Time.deltaTime;
		}
	}
	*/
}

function Open()
{
	if (!open)
	{
		open = true;
		animator.SetTrigger("open");
		box_col.enabled = false;
	}
}