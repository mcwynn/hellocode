#pragma strict

function OnTriggerEnter2D(col : Collider2D)
{
	var col_obj : GameObject = col.gameObject;

	// the collision object is the player character
	if (col_obj.tag == "player")
	{
		var y_distance : float = Mathf.Abs(col_obj.transform.position.y - transform.position.y);
		var x_distance : float = Mathf.Abs(col_obj.transform.position.x - transform.position.x);
		var p_facing : int = col_obj.GetComponent.<player>().facing;
		var p_in_air : boolean = col_obj.GetComponent.<player>().in_air;

		// the player is close enough for a ledge grab and is in the air
		if (y_distance < 1 && x_distance < 0.5 && p_in_air)
		{
			// the player is facing the ledge
			if ((col_obj.transform.position.x < transform.position.x && p_facing == 1) ||
				(col_obj.transform.position.x > transform.position.x && p_facing == -1))
			{
				col_obj.GetComponent.<player>().animator.SetBool("ledge_grab", true);
				col_obj.transform.position = new Vector2(transform.position.x + (0.25 * p_facing),
														 transform.position.y + 1);
				col_obj.GetComponent.<player>().ledge_grab();
			}
			
		}
	}
}