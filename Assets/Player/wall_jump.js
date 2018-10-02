#pragma strict

private var on_wall_delay : int = 120;
private var off_wall_timer : int = 0;

function Update()
{
	if (off_wall_timer > 0)
		off_wall_timer--;
}

function OnTriggerEnter2D(trigger_col : Collider2D)
{
	if (trigger_col.tag == "player")
	{
		if (off_wall_timer <= 0)
		{
			Debug.Log(off_wall_timer);
			trigger_col.gameObject.GetComponent.<player>().land_on_wall();
			off_wall_timer = on_wall_delay;
		}
	}
}