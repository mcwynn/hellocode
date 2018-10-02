#pragma strict

/*
    HELPER FUNCTIONS: These are static functions accessible by any script.
    	* use helper.function_name() to use these functions from another script.
	(1) find_nearest_tag(game_obj, tag)
		-> Finds the nearest object with the given tag to the given object.
	(2) 
		-> 
*/

static var PLAYER_OBJ : GameObject;

function Start()
{
	PLAYER_OBJ = GameObject.FindGameObjectWithTag("player");
}

// Pre:  Needs a game object and a tag as a string.
// Post: Finds and returns the closest tagged object.
static function find_closest_tag (player : GameObject, tag : String) : GameObject 
{
	// Find all game objects with tag editable
	var game_objs : GameObject[];
	game_objs = GameObject.FindGameObjectsWithTag(tag); 
	var closest : GameObject; 
	var distance = Mathf.Infinity; 
	var position = player.transform.position;

	// Iterate through them and find the closest one
	for (var curr_obj : GameObject in game_objs)  { 
		var curDistance = Vector2.Distance(curr_obj.transform.position, position); 
		if (curDistance < distance) { 
			closest = curr_obj; 
			distance = curDistance; 
		} 
	} 
	return closest;	
}

// Pre:  Needs a game object and a tag as a string.
// Post: Finds and returns the closest tagged object the player is currently facing.
static function find_closest_facing_enemy(facing : int) : GameObject 
{
	var enemy_tag : String = "robot";

	// Find all game objects with tag enemy
	var game_objs : GameObject[];
	game_objs = GameObject.FindGameObjectsWithTag(enemy_tag); 
	var closest : GameObject; 
	var distance = Mathf.Infinity;
	var position = PLAYER_OBJ.transform.position;

	// Iterate through them and find the closest one
	for (var curr_obj : GameObject in game_objs)  { 
		var curDistance = Vector2.Distance(curr_obj.transform.position, position); 
		if (curDistance < distance) {
			if ((facing == 1 && position.x < curr_obj.transform.position.x) ||
				(facing == -1 && position.x > curr_obj.transform.position.x))
			{
				closest = curr_obj; 
				distance = curDistance; 
			}
		} 
	} 
	return closest;	
}