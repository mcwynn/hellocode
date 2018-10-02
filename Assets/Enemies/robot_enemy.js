#pragma strict

var player : GameObject;

// AI variables
var unhackable : boolean = false;
private var hack_attempted : boolean = false;
var power_on : boolean = true;
var alert : boolean = false;
var attacking : boolean = false;
var facing : int = 1; // 1 = right, -1 = left
var move_speed : int = 2;
var view_dist : int = 15;
var atk_range : int = 10;
var atk_delay : int = 60;
private var atk_delay_reset : int = 100;
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

var animator : Animator;

// Sprites
var spr_powered_on : Sprite;
var spr_powered_off : Sprite;

private var player_pos : Vector2;
private var player_dist : float;
var bullet : GameObject;
private var bullet_spacing : int = 600;

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
		Debug.Log(player_pos.x);

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
															 transform.position.y + 0.5);
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

function take_hit()
{
	if (hp > 0)
	{
		hp -= 5;

		if (hp <= 0)
			power_on = false;

		var hp_percent : float = hp / MAX_HP;
		health_bar.transform.localScale = new Vector2(hp_percent, 1);
		//knock_back = true;
	}
}

function hacked()
{
	power_on = false;
	GetComponent.<SpriteRenderer>().sprite = spr_powered_off;
}

function hack_attempt(successful : boolean)
{
	if (successful)
	{
		power_on = false;
	}

	hack_attempted = true;
}

function OnCollisionEnter2D (collision : Collision2D) 
{
	// checks if the collision object is a function bullet
	if (collision.gameObject.tag == "function_bullet")
	{
		if (power_on && (unhackable || hack_attempted))
		{
			// brute force it
			take_hit();
		}
	}


}