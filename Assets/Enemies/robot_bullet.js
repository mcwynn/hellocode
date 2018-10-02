#pragma strict

function OnCollisionEnter2D (collision : Collision2D) 
{
	if (collision.gameObject.tag == "player")
	{
		collision.gameObject.GetComponent.<player>().take_normal_hit();

	}

	Destroy(gameObject);
}