#pragma strict

// Pre:  Collision2D holds collision information from physics collision
// Post: Destroys bullet object if it hits something other than the player
function OnCollisionEnter2D (collision : Collision2D) 
{
	if (collision.gameObject.tag != "player" && collision.gameObject.tag != "sidekick")
	{
		Destroy(gameObject);
	}
}