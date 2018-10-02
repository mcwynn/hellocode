#pragma strict

var player : GameObject;

// AI variables
var power_on : boolean = true;
var alert : boolean = false;
var attacking : boolean = false;
var facing : int = 1; // 1 = right, -1 = left
var move_speed : int = 2;
var view_dist : int = 10;
var atk_range : int = 7;
var atk_delay : int = 60;
private var atk_delay_reset : int = 200;
var MAX_HP : float = 20;
var hp : float = 20;
var health_bar : GameObject;

var knock_back : boolean = false;
var knock_back_timer : int = 0;
var knock_back_exit : int = 10;

// States
private var idle : boolean = true;
private var walking : boolean = false;
private var shooting : boolean = false;

// Sprites
var spr_powered_on : Sprite;
var spr_powered_off : Sprite;
var animator : Animator;

private var player_pos : Vector2;
private var player_dist : float;
var bullet : GameObject;
private var bullet_spacing : int = 300;

// hack message
private var display_hack_message : boolean = false;
private var hack_message_timer : float = 3;
private var hack_timer_reset : float = hack_message_timer;
private var hack_success_txt : String = "Hack Success!";
private var hack_fail_txt : String = "Access Denied!";
private var hack_txt : String = hack_success_txt;
var hack_message : GameObject;
var obj_hack_txt : GameObject;
var obj_hack_txt_stroke : GameObject;

// hack data
var grade_0 : float = 4.0;
var grade_1 : float = 4.0;
var grade_2 : float = 4.0;
var correct_gpa : float = 4.0;

function Start()
{
	player = GameObject.FindGameObjectWithTag("player");
	animator = GetComponent.<Animator>();
}

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
				if (attacking)
				{
					attacking = false;
					animator.SetBool("shooting", false);
					walking = true;
					animator.SetBool("walking", true);
					Debug.Log("walking");
				}
				GetComponent.<Rigidbody2D>().velocity.x = move_speed * facing;

			// else attack
			} else {
				if (walking)
				{
					walking = false;
					animator.SetBool("walking", false);
					attacking = true;
					animator.SetBool("shooting", true);
					Debug.Log("attacking");
				}
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
			if (idle)
			{
				idle = false;
				animator.SetBool("idle", false);
				walking = true;
				animator.SetBool("walking", true);
				Debug.Log("walking");
			}

		// they are hacked and no longer function
		} else {
			GetComponent.<Rigidbody2D>().velocity.x = 0;
			if (!idle)
			{
				idle = true;
				animator.SetBool("idle", true);
			}
		}

		if (knock_back)
		{
			if (knock_back_timer < knock_back_exit)
			{
				knock_back_timer++;
				GetComponent.<Rigidbody2D>().velocity.x = move_speed * -facing;
			} else {
				knock_back_timer = 0;
				knock_back = false;
			}
		}
	}

	if (display_hack_message && hack_message_timer > 0)
	{
		hack_message.GetComponent.<Canvas>().enabled = true;
		hack_message_timer -= Time.deltaTime;

	} else if (display_hack_message)
	{
		hack_message_timer = hack_timer_reset;
		display_hack_message = false;
		hack_message.GetComponent.<Canvas>().enabled = false;
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
			hack_txt = hack_success_txt;

		} else {
			hack_txt = hack_fail_txt;
		}

		obj_hack_txt.GetComponent.<Text>().text = hack_txt;
		obj_hack_txt_stroke.GetComponent.<Text>().text = hack_txt;
		display_hack_message = true;
	}
}

function sword_hit()
{
	if (hp > 0)
	{
		hp -= 5;

		if (hp <= 0)
			power_on = false;

		var hp_percent : float = hp / MAX_HP;
		health_bar.transform.localScale = new Vector2(hp_percent, 1);
		knock_back = true;
	}
}


/* Function Solution
def calculate_gpa(grade_0, grade_1, grade_2):
    grade_total = grade_0 + grade_1 + grade_2
    num_grades = 3
    
    gpa = grade_total / num_grades
    
    return gpa

*/