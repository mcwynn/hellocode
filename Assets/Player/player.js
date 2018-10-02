#pragma strict

// Author : Michael Wynn
// Purpose: Controls the player character's movement
//----------------------------------------------------------------------------

import UnityEngine.SceneManagement;

// Movement
var animator : Animator;
var run_speed : float = 2;
var jump_strength : int = 10;
var in_air_movespeed : int = 5;
var facing : int = 1;  //1 = Right, -1 = Left
var is_ground : LayerMask;
var is_platform : LayerMask;
var ground_check : Transform;
var ground_check_radius : float;

private var x_velocity : float = 0.0;
private var y_velocity : float = 0.0;
private var on_ground : boolean = false;
private var on_platform : boolean = false;
private var closest_platform : GameObject;

// Player finite states
var idle : boolean = false;
var run : boolean = false;
var in_air : boolean = true;
var aim : boolean = false;
var shooting : boolean = false;
var sword_stance : boolean = false;
var sword_attack : boolean = false;
var in_editor : boolean = false;
var landing : boolean = false;
var on_wall : boolean = false;
var grabbing_ledge : boolean = false;

var shooting_auto_exit : float = 220f / 60f;
var shooting_timer : float = 0;
var sword_auto_exit : float = 40f / 60f;
var sword_timer : float = 0;
var sword_combo : float = 0;
var in_air_timer : float = 0;
var landing_delay : float = 2f / 60f;
var LANDING_DELAY_RESET : float = 2f / 60f;
private var landing_exit : float = 7f / 60f;
private var landing_timer : float = 0;
private var on_wall_timer : float = 0;
private var on_wall_exit : float = 50f / 60f;
private var on_ledge_timer : float = 0;
private var on_ledge_exit : float = 0.8f;//48 / 60;

// Use Object Variables
private var usable_tag : String = "usable";
private var usable_distance : float = 1.5;
private var show_hack_data : boolean = false;

// Editor References
var text_editor_script : text_editor;
var editor_up : boolean = false;

// Stored Functions
private var f_gun : String = "";
private var f_sword : String = "";

// Attack Variables
var closest_facing_enemy : GameObject;
var function_bullet : GameObject;
private var gun_cool_down : float = 20f / 60f;
private var gun_cool_down_reset : float = gun_cool_down;
private var f_gun_activation_timer : float = 0;
private var f_gun_activation_start : float = 10f / 60f;
private var f_gun_cool_down : float = 120f / 60f;
private var f_gun_cool_down_reset : float = gun_cool_down;
private var sword_cool_down : float = 120f / 60f;
private var sword_cool_down_reset : float = sword_cool_down;
private var sword_attack_range : float = 2f;
private var bullet_spacing : float = 300f;
private var bullet_speed : float = 1000f;
private var enemy_distance : float;

// Player resources
var MAX_HP : float = 100;
private var hp : float = MAX_HP;
var MAX_CAPACITORS : float = 100;
private var capacitors : float = MAX_CAPACITORS;
var hp_bar : GameObject;
var cp_bar : GameObject;

private var curr_hp_percentage : float; // in range(0.0, 1.0)
private var curr_cp_percentage : float; // in range(0.0, 1.0)

private var normal_hit_damage : float = 10;
private var hacked_hit_damage : float = 20;

// Audio/Sound Effects
var audio_source : AudioSource;
var sfx_footstep : AudioClip;
private var run_timer : float = 0f;
private var footstep_playing : boolean = false;
var sfx_ledge_grab : AudioClip;
var sfx_jump : AudioClip;
var sfx_gun : AudioClip;

// Python Interpreter Scope
private var P_scope = text_editor_script.pyEngine.CreateScope();


// background
var bg_image : GameObject;
private var bg_scroll_spd : float = 0.001;

private var start_pos : Vector2;

private var last_pos : Vector2;

// Pre:  Initialize at startup, only runs once.
// Post: Assigns the animator component to the animator variable.
function Awake()
{
	if (GameProgressHandler.getCheckPoint() != 0) {
		transform.position = GameProgressHandler.getCheckPointPosition();
	}
	else {
		GameProgressHandler.updateCheckPoint(0, transform.position);
	}
	animator = GetComponent.<Animator>();
	start_pos = transform.position;
	audio_source = GetComponent.<AudioSource>();


}

// Pre : Runs every frame
// Post: Handles input, movement, and attacking.
function Update() 
{
	// Can't move or attack when editor is up
	if (!Framework.text_editor_active)
	{
		// get movement input
		var key_left = Input.GetKey(KeyCode.A);
		var key_right = Input.GetKey(KeyCode.D);
		var key_jump = Input.GetKey(KeyCode.Space);

		// get gameplay input
		var key_aim = Input.GetKey(KeyCode.LeftShift);
		var key_shoot = Input.GetKeyDown(KeyCode.J);
		var key_shoot_released = Input.GetKeyUp(KeyCode.J);
		var key_sword = 0;//Input.GetKeyDown(KeyCode.K);
		//var key_sword_right = Input.GetKeyDown(KeyCode.RightArrow);
		//var key_sword = key_sword_left || key_sword_right;
		var key_action = Input.GetKeyDown(KeyCode.E);
		var key_hack_data = Input.GetKeyDown(KeyCode.H);

		var key_exit = Input.GetKeyDown(KeyCode.Escape);

		if (key_exit)
		{
			Framework.reset_level_data();
			SceneManager.LoadScene("main_menu");
		}

		if (key_hack_data)
		{
			if (!show_hack_data)
			{
				show_hack_data = true;
				for (var puzzle_obj : GameObject in Framework.puzzles)
				{
					if (puzzle_obj.GetComponent.<PuzzleBase>().has_editable_obj)
						puzzle_obj.GetComponent.<PuzzleObjectHandler>().show_hack_data();
				}
			} else {
				show_hack_data = false;
				for (var puzzle_obj : GameObject in Framework.puzzles)
				{
					if (puzzle_obj.GetComponent.<PuzzleBase>().has_editable_obj)
						puzzle_obj.GetComponent.<PuzzleObjectHandler>().hide_hack_data();
				}
			}
			
		}

		on_ground = Physics2D.OverlapCircle(ground_check.position, 
										ground_check_radius, is_ground);
		on_platform = Physics2D.OverlapCircle(ground_check.position, 
											  ground_check_radius, is_platform);

		if (on_platform)
		{
			closest_platform = helper.find_closest_tag(this.gameObject, 
													   'platform');
			this.gameObject.transform.parent = closest_platform.transform;
		} else
		{
			this.gameObject.transform.parent = null;
		}
		

		// states
		if (idle)
		{

			if (key_right && !key_left) 
			{
				facing = 1;
				GetComponent.<SpriteRenderer>().flipX = false;
				run = true;
				animator.SetBool("run", true);

				idle = false;
				animator.SetBool("idle", false);

			} else if (key_left && !key_right)
			{
				facing = -1;
				GetComponent.<SpriteRenderer>().flipX = true;
				run = true;
				animator.SetBool("run", true);

				idle = false;
				animator.SetBool("idle", false);

			}

			// Jump
			if (key_jump && (on_ground || on_platform))
			{
				GetComponent.<Rigidbody2D>().velocity.y = jump_strength;
				idle = false;
				animator.SetBool("idle", false);

				in_air = true;
				animator.SetBool("jump", true);

				audio_source.PlayOneShot(sfx_jump, 0.75);
			}

			if (!on_ground && !on_platform)
			{
				idle = false;
				animator.SetBool("idle", false);

				in_air = true;
				animator.SetBool("fall", true);
			}

			// Fire function gun
			if (key_aim)
			{
				aim = true;
				animator.SetBool("aim", true);

				idle = false;
				animator.SetBool("idle", false);


				
			}

			// Sword attack
			if (key_sword)
			{
				sword_attack = true;
				sword_combo = 0;
				sword_stance = true;
				animator.SetBool("sword_1", true);

				idle = false;
				animator.SetBool("idle", false);	
			}

		} else if (run)
		{

			//if (GetComponent.<SpriteRenderer>().sprite == footstep_frame_0 || 
			//	GetComponent.<SpriteRenderer>().sprite == footstep_frame_1)
			if (run_timer > 0.25 && !footstep_playing)
			{
				audio_source.PlayOneShot(sfx_footstep, Random.Range(0.25, 0.45));
				footstep_playing = true;

			} else if (run_timer > 0.5)
			{
				run_timer = 0f;
				footstep_playing = false;

			} else {
				run_timer += Time.deltaTime;
			}

			if (key_right && !key_left) 
			{
				facing = 1;
				GetComponent.<SpriteRenderer>().flipX = false;
				
				if (x_velocity < 0)
					x_velocity = 0;
				else if (x_velocity < run_speed * facing)
					x_velocity += 0.5;
				else
					x_velocity = run_speed * facing;

			} else if (key_left && !key_right)
			{
				facing = -1;
				GetComponent.<SpriteRenderer>().flipX = true;
				if (x_velocity > 0)
					x_velocity = 0;
				else if (x_velocity > run_speed * facing)
					x_velocity -= 0.5;
				else
					x_velocity = run_speed * facing;

			} else {
				x_velocity = 0;
				run = false;
				animator.SetBool("run", false);

				idle = true;
				animator.SetBool("idle", true);

				run_timer = 0f;
				footstep_playing = false;
			}

			// Jump & fall
			if (key_jump && (on_ground || on_platform))
			{
				GetComponent.<Rigidbody2D>().velocity.y = jump_strength * 0.9;
				x_velocity = jump_strength * facing * 0.9;
				run = false;
				animator.SetBool("run", false);

				in_air = true;
				animator.SetBool("jump", true);

				run_timer = 0f;
				footstep_playing = false;

				audio_source.PlayOneShot(sfx_jump, 0.75);

			} else if (!on_ground && !on_platform)
			{
				run = false;
				animator.SetBool("run", false);

				in_air = true;
				animator.SetBool("fall", true);

				run_timer = 0f;
				footstep_playing = false;
			}

			// Sword attack
			if (key_sword)
			{
				sword_attack = true;
				sword_combo = 0;
				sword_stance = true;
				animator.SetBool("sword_1", true);

				run = false;
				animator.SetBool("run", false);
				x_velocity = 0;

				run_timer = 0f;
				footstep_playing = false;
			}


		} else if (in_air)
		{
			//Debug.Log("in_air");

			if (in_air_timer > 0.5f)
			{
				animator.SetBool("fall", true);
			}

			// in the air, still can move a little
			if (key_right) 
			{
				if (x_velocity <= in_air_movespeed)
					x_velocity += 0.2;
				else
					x_velocity *= 0.98;

			} else if (key_left)
			{
				if (x_velocity >= -in_air_movespeed)
					x_velocity -= 0.2;
				else
					x_velocity *= 0.98;

			} else 
			{
				x_velocity -= Mathf.Sign(x_velocity) * 0.01;
			}

			if (x_velocity > 0.1 && facing == -1)
			{
				facing = 1;
				GetComponent.<SpriteRenderer>().flipX = false;
			} else if (x_velocity < -0.1 && facing == 1)
			{
				facing = -1;
				GetComponent.<SpriteRenderer>().flipX = true;
			}

			if ((on_ground || on_platform) && landing_delay <= 0)
			{
				//Debug.Log('landed');
				audio_source.PlayOneShot(sfx_footstep, 0.7);

				in_air = false;
				animator.SetBool("jump", false);
				animator.SetBool("fall", false);

				landing = true;
				animator.SetBool("landed", true);
				landing_delay = LANDING_DELAY_RESET;
				in_air_timer = 0;
			}

			if (last_pos.x == transform.position.x && Mathf.Abs(x_velocity) > 1)
				x_velocity = 0;

			if (landing_delay > 0)
				landing_delay -= 1 * Time.deltaTime;
				Debug.Log(landing_delay);

			in_air_timer += 1 * Time.deltaTime;
			
		} else if (landing)
		{
			if (landing_timer >= landing_exit)
			{
				landing = false;
				animator.SetBool("landed", false);
				landing_timer = 0;


				if (Mathf.Abs(GetComponent.<Rigidbody2D>().velocity.x) > 0.5)
				{
					run = true;
					animator.SetBool("run", true);
				} else {
					idle = true;
					animator.SetBool("idle", true);
					x_velocity = 0;
				}
			} else {
				landing_timer += 1 * Time.deltaTime;
			}
			
		} else if (grabbing_ledge)
		{
			if (on_ledge_timer >= on_ledge_exit)
			{
				on_ledge_timer = 0;
				idle = true;
				grabbing_ledge = false;
				animator.SetBool("idle", true);
				//transform.position = new Vector2(transform.position.x + (0.5 * facing), 
				//								 transform.position.y + 0.6);
				GetComponent.<Rigidbody2D>().gravityScale = 1.5;
			} else {
				on_ledge_timer += 1 * Time.deltaTime;
			}

		} else if (on_wall)
		{
			x_velocity = 0;

			if (on_wall_timer < on_wall_exit)
				on_wall_timer += 1 * Time.deltaTime;

			if (key_jump)
			{
				on_wall = false;
				animator.SetBool("on_wall", false);
				in_air = true;
				animator.SetBool("jump", true);
				GetComponent.<Rigidbody2D>().gravityScale = 1.5;

				facing *= -1;
				GetComponent.<Rigidbody2D>().velocity.y = jump_strength;
				x_velocity = (jump_strength / 2) * facing;
				//Debug.Log(facing);
				if (facing == -1)
					GetComponent.<SpriteRenderer>().flipX = true;
				else
					GetComponent.<SpriteRenderer>().flipX = false;

			} else if (on_wall_timer >= on_wall_exit)
			{
				on_wall_timer = 0;
				on_wall = false;
				animator.SetBool("on_wall", false);
				in_air = true;
				animator.SetBool("fall", true);
				
				facing *= -1;
				GetComponent.<Rigidbody2D>().gravityScale = 1.5;
				x_velocity = facing * 3;
				//Debug.Log(facing);
				if (facing == -1)
					GetComponent.<SpriteRenderer>().flipX = true;
				else
				 	GetComponent.<SpriteRenderer>().flipX = false;
			}

		} else if (aim)
		{
			if (!key_aim)
			{
				shooting = false;
				aim = false;
				shooting = false;
				animator.SetBool("shooting", false);
				animator.SetBool("aim", false);
				idle = true;
				animator.SetBool("idle", true);
				gun_cool_down = gun_cool_down_reset;
			} else
			{
				if (key_shoot && gun_cool_down <= 0)
				{
					animator.SetBool("shooting", true);
					// assign bullet position
					var bullet_start_pos : Vector2 = new Vector2(transform.position.x + facing, 
																 transform.position.y + 0.4);
					// instantiate bullet
					var new_bullet = Instantiate(function_bullet, bullet_start_pos, 
												 Quaternion.identity);

					// adds a force to the bullet to propel it forward
					// note: since I'm using the function in the physics engine 
					//		 OnCollisionEnter() for collisions with the bullet and 
					//		 the enemy I need to use the physics rigid body to move it.
					var new_bullet_rb = new_bullet.GetComponent.<Rigidbody2D>();
					new_bullet_rb.AddForce(new Vector2(bullet_speed * facing, 0));
					gun_cool_down = gun_cool_down_reset;
					shooting_timer = 0;
					

				// Timer until able to shoot again
				} else if (gun_cool_down > 0)
				{
					gun_cool_down -= 1 * Time.deltaTime;
				
				} else {
					shooting_timer += 1 * Time.deltaTime;
				}

				if (key_right && !key_left) 
				{
					facing = 1;
					GetComponent.<SpriteRenderer>().flipX = false;

				} else if (key_left && !key_right)
				{
					facing = -1;
					GetComponent.<SpriteRenderer>().flipX = true;

				}

			}
		} else if (sword_stance)
		{
			if (key_sword && sword_timer > 30 && sword_timer < 60 && sword_combo < 3)
			{
				sword_attack = true;
				sword_timer = 0;
				sword_combo += 1;
				animator.SetBool("sword_1", true);
				animator.SetBool("idle", false);
				Debug.Log(sword_combo);
			}

			if (sword_combo == 4)
			{
				sword_cool_down--;
			}

			if (sword_cool_down <= 0)
			{
				sword_cool_down = sword_cool_down_reset;
				sword_combo = 0;
			}

			if (sword_attack && sword_combo == 0)
			{
				// Sword Attack
				if (sword_timer == 30)
				{
					closest_facing_enemy = helper.find_closest_facing_enemy(facing);

					if (closest_facing_enemy != null)
					{
						enemy_distance = Vector2.Distance(closest_facing_enemy.transform.position, transform.position);

						if (enemy_distance <= sword_attack_range)
						{
							closest_facing_enemy.SendMessage("sword_hit");
						}
					}
					sword_timer++;
				}

				if (sword_timer > 25 && sword_timer < 35)
					x_velocity = 4 * facing;
				else
					x_velocity = 0;

				if (sword_timer >= 60) 
				{
					sword_attack = false;
					sword_combo = 0;
				}
			} else if (sword_attack && sword_combo == 1)
			{
				// Sword Attack
				if (sword_timer == 30)
				{
					closest_facing_enemy = helper.find_closest_facing_enemy(facing);

					if (closest_facing_enemy != null)
					{
						enemy_distance = Vector2.Distance(closest_facing_enemy.transform.position, transform.position);
						Debug.Log(enemy_distance);
						Debug.Log(sword_attack_range);

						if (enemy_distance <= sword_attack_range)
						{
							closest_facing_enemy.SendMessage("sword_hit");
						}
					}
					sword_timer++;
				}

				if (sword_timer > 25 && sword_timer < 35)
					x_velocity = 4 * facing;
				else
					x_velocity = 0;

				if (sword_timer >= 60) 
				{
					sword_attack = false;
					sword_combo = 0;
				}
			} else if (sword_attack && sword_combo == 2)
			{
				// Sword Attack
				if (sword_timer == 30)
				{
					closest_facing_enemy = helper.find_closest_facing_enemy(facing);

					if (closest_facing_enemy != null)
					{
						enemy_distance = Vector2.Distance(closest_facing_enemy.transform.position, transform.position);
						Debug.Log(enemy_distance);
						Debug.Log(sword_attack_range);

						if (enemy_distance <= sword_attack_range)
						{
							closest_facing_enemy.SendMessage("sword_hit");
						}
					}
					sword_timer++;
				}

				if (sword_timer > 25 && sword_timer < 35)
					x_velocity = 4 * facing;
				else
					x_velocity = 0;

				if (sword_timer >= 60) 
				{
					sword_attack = false;
					sword_combo = 4;
				}
			}

			if (!sword_attack)
			{
				animator.SetBool("sword_1", false);
				animator.SetBool("idle", true);
			}


			// exit sword stance
			if (sword_timer >= sword_auto_exit) {
				sword_cool_down = 0;
				sword_timer = 0;
				sword_combo = 0;
				sword_attack = false;
				sword_stance = false;
				animator.SetBool("sword_1", false);
				idle = true;
				animator.SetBool("idle", true);
			} else
			{
				sword_timer++;
			}
			
		}

		// adds x_velocity (calculated above) to the player's physics,
		// moves the player
		GetComponent.<Rigidbody2D>().velocity.x = x_velocity;

		// Handle using objects
		if (key_action)
		{
			use_object();
		}


	}

}

function LateUpdate()
{
	// move bg
	if (GetComponent.<Rigidbody2D>().velocity.x != 0)
	{
		bg_image.transform.position.x += GetComponent.<Rigidbody2D>().velocity.x * -bg_scroll_spd;
	}
	if (GetComponent.<Rigidbody2D>().velocity.y != 0)
	{
		bg_image.transform.position.y += GetComponent.<Rigidbody2D>().velocity.y * -bg_scroll_spd;
	}

	last_pos = transform.position;
}


// ------------------------------
// Helper Functions
// ------------------------------

// Pre:  Useable object must have a function called 'use_object'.
// Post: Finds nearest useable object, caclulates the distance from player, 
//		 and uses the object if its close enough.
private function use_object()
{
	// find closest object with the useable tag, then finds its distance from the player
	var nearest_useable_obj : GameObject = helper.find_closest_tag(this.gameObject, usable_tag);
	var obj_distance = Vector2.Distance(transform.position, 
										nearest_useable_obj.transform.position);

	// if close enough to use object, run 'use_object' function on nearest_useable_obj
	if (obj_distance <= usable_distance)
	{
		nearest_useable_obj.SendMessage("use_object", SendMessageOptions.DontRequireReceiver);
	}
}

// Pre:  Needs the data from the robot as an array, and the function name as a string.
// Post: Runs the input data through the player's function, returns the new data.
function FunctionGun (input_data : Array, function_name)
{
	var new_data : float = 0;

	if (f_gun.Contains("def " + function_name))
	{
		var code : String = f_gun + "\n\n";

		// sets up the code for the function depending on the number of parameters
		if (input_data.length == 1)
		{
			code += "input_data = " + input_data + "\n";
			code += "return_val = " + function_name + "(input_data)";

		} else if (input_data.length == 2)
		{
			code += "input_data_a = " + input_data[0] + "\n";
			code += "input_data_b = " + input_data[1] + "\n";
			code += "return_val = " + function_name + "(input_data_a, input_data_b)";

		} else if (input_data.length == 3)
		{
			code += "input_data_a = " + input_data[0] + "\n";
			code += "input_data_b = " + input_data[1] + "\n";
			code += "input_data_c = " + input_data[2] + "\n";
			code += "return_val = " + function_name + "(input_data_a, input_data_b, input_data_c)";
		}

		// executes the code
		var sourceP = text_editor_script.pyEngine.CreateScriptSourceFromString(code);
		sourceP.Execute(P_scope);

		// grabs the return value
		new_data = P_scope.GetVariable.<float>("return_val");
	}
	

	return new_data;
}

//
//
function take_normal_hit()
{
	if (hp > normal_hit_damage)
	{
		hp -= normal_hit_damage;
		curr_hp_percentage = hp / MAX_HP;
		hp_bar.transform.localScale = new Vector3(curr_hp_percentage, 1, 1);
	} else
	{
		hp = MAX_HP;
		hp_bar.transform.localScale = new Vector3(1, 1, 1);

		/*if (Framework.terminal_target != null)
			transform.position = Framework.terminal_target.transform.position;
		else
			transform.position = start_pos;
		*/

		transform.position = GameProgressHandler.getCheckPointPosition();
	}
	
}


// Pre:  Needs the player's function as a string.
// Post: Assigns the player's function to the function gun string.
function assign_f_gun(player_function : String)
{
	f_gun = player_function;
}

// Pre:  Needs the player's function as a string.
// Post: Assigns the player's function to the function sword string.
function assign_f_sword(player_function : String)
{
	f_sword = player_function;
}

//
//
//function OnTriggerEnter(trigger_col : Collider)

function ledge_grab()
{
	audio_source.PlayOneShot(sfx_ledge_grab, 0.7);

	grabbing_ledge = true;
	landing_delay = LANDING_DELAY_RESET;
	in_air = false;
	landing = false;
	animator.SetBool("jump", false);
	animator.SetBool("fall", false);
	GetComponent.<Rigidbody2D>().velocity.x = 0;
	GetComponent.<Rigidbody2D>().velocity.y = 0;
	x_velocity = 0;
	y_velocity = 0;
	GetComponent.<Rigidbody2D>().gravityScale = 0;
}

function land_on_wall()
{
	
	if (in_air)
	{
		in_air = false;
		animator.SetBool("jump", false);
		animator.SetBool("fall", false);

		on_wall = true;
		animator.SetBool("on_wall", true);
		GetComponent.<Rigidbody2D>().gravityScale = 0.15;
		GetComponent.<Rigidbody2D>().velocity.y = 0;
		on_wall_timer = 0;

	}
}

function OnCollisionEnter2D (col : Collision2D) {
	if (on_platform) {
		if (col.gameObject.tag != "platform") {
			closest_platform.GetComponent.<Platform>().cancel_moves = true;
		}
	}
}