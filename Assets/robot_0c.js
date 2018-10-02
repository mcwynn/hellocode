#pragma strict

var player : GameObject;

// AI variables
var power_on : boolean = true;
var alert : boolean = false;
var attacking : boolean = false;
var facing : int = 1; // 1 = right, -1 = left
var move_speed : int = 2;
var view_dist : int = 15;
var atk_range : int = 10;
var atk_delay : int = 60;
private var atk_delay_reset : int = 200;

// Sprites
var spr_powered_on : Sprite;
var spr_powered_off : Sprite;

private var player_pos : Vector2;
private var player_dist : float;
var bullet : GameObject;
private var bullet_spacing : int = 300;

// hack data
var grade_0 : float = 1.0;
var grade_1 : float = 0.0;
var grade_2 : float = 2.0;
var correct_gpa : float = 1.0;

function Update ()
{
	// alive
	if (power_on)
	{
		// get player's position and distance
		player_pos = player.transform.position;
		player_dist = Vector2.Distance(player_pos, transform.position);

		// aggressive / alerted to player
		if (alert)
		{
			// change facing and flip sprite
			if (player_pos.x > transform.position.x)
			{
				facing = 1;
				GetComponent.<SpriteRenderer>().flipX = false;
			} else
			{
				facing = -1;
				GetComponent.<SpriteRenderer>().flipX = true;
			}

			// if not close enough to attack, move closer to player
			if (player_dist > atk_range)
			{
				attacking = false;
				GetComponent.<Rigidbody2D>().velocity.x = move_speed * facing;

			// else attack
			} else {
				attacking = true;
			}

			// if close enough and attacking
			if (attacking && atk_delay <= 0)
			{
				// reset attack delay
				atk_delay = atk_delay_reset;

				// set bullet position and instantiate bullet
				var bullet_start_pos : Vector2 = new Vector2(transform.position.x + facing, 
															 transform.position.y);
				var new_bullet = Instantiate(bullet, bullet_start_pos, Quaternion.identity);

				// add force to bullet
				new_bullet.GetComponent.<Rigidbody2D>().AddForce(new Vector2(bullet_spacing * facing, 0));
				
			} else if (attacking)
			{
				// reduce attack timer
				atk_delay--;
			}

		// if close enough to player set alert status
		} else if (player_dist < view_dist) 
		{
			alert = true;

		// they are hacked and no longer function
		} else {
			GetComponent.<Rigidbody2D>().velocity.x = 0;
		}
	}
}

// Pre:  This function is called upon impact of a physics enabled object. 
//       It's given a collision parameter with the collision information.
// Post: If the collision is with a function bullet from the player it runs its hack data 
//		 through the player's function. If the correct answer is returned it shuts down the robot.
function OnCollisionEnter2D (collision : Collision2D) 
{
	// checks if the collision object is a function bullet
	if (collision.gameObject.tag == "function_bullet")
	{
		// assigns data to run in the function and runs the function
		var hack_data = new Array(grade_0, grade_1, grade_2);
		var function_name : String = "calculate_gpa";
		var override_data = player.GetComponent.<player>().FunctionGun(hack_data, function_name);

		// checks returned value for correctness
		if (override_data == correct_gpa)
		{
			power_on = false;
			GetComponent.<SpriteRenderer>().sprite = spr_powered_off;
		}
	}
}