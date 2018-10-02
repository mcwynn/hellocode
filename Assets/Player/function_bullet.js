#pragma strict

// Author : Michael Wynn
// Purpose: Handles the collision of the function gun bullet
//----------------------------------------------------------------------------

private var bullet_timer : float = 0f;
private var bullet_kill : float = 0.25f;

function Update () {
	if (bullet_timer < bullet_kill) {
		bullet_timer += Time.deltaTime;
		Debug.Log(bullet_kill);
	} else {
		Destroy(gameObject);
		Debug.Log("bullet kill");
	}
}

// Pre:  Collision2D holds collision information from physics collision
// Post: Destroys bullet object if it hits something other than the player
function OnCollisionEnter2D (collision : Collision2D) {
	if (collision.gameObject.tag != "player") {
		Destroy(gameObject);
	}
}