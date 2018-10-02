#pragma strict

private var editable_base_script : Editable;

// editable variables
private var rotating_right : boolean = false;
private var rotating_left : boolean = false;

// actions
var rotate_right : boolean = false;
var rotate_left : boolean = false;
var rotation_amount : float = 0.0;
var rotation_velocity : float = 1.0;
var fan_speed : float = 0.0;
var target_rot : Vector3;
private var curr_rotation : Vector3;
private var fan_effector : PointEffector2D;
private var min_speed : float = 0.0;
private var max_speed : float = 25.0;

// reset variables
private var original_rot : Vector3;
private var r_velocity : float;
private var r_rotation_amount : float;
private var r_target_rot : Vector2;


private var rotate_direction : float;
private var PPU : float = 100;
private var rotate_action : boolean = false;

function Start() 
{
	editable_base_script = GetComponent.<Editable>();
	//original_rot = transform.rotation;
	r_velocity = rotation_velocity;
	r_rotation_amount = rotation_amount;
	fan_effector = GetComponent.<PointEffector2D>();
}

function Update() 
{
	fan_effector.forceMagnitude = (fan_speed / 100) * max_speed;
	Debug.Log(fan_effector.forceMagnitude);

	if (rotate_action)
	{
		curr_rotation = transform.eulerAngles;
		Debug.Log("curr_rot = " + curr_rotation.ToString() + "    tar_rot = " + target_rot.ToString());
		if (transform.eulerAngles != target_rot)
		{
			//rotate_pos = Vector2.MoveTowards(transform.position, target_rot, rotation_velocity * Time.deltaTime);
			//transform.rotation = rotate_pos;

			if (rotating_right)
			{
				Debug.Log("rotating");
				//transform.Rotate(Vector3.right * rotation_velocity * Time.deltaTime);
				//transform.rotation = Quaternion.Slerp(transform.rotation, target_rot, Time.deltaTime * rotation_velocity);
				transform.eulerAngles = new Vector3(curr_rotation.x, curr_rotation.y + rotation_velocity, curr_rotation.z);
			} else if (rotating_left)
			{
				transform.Rotate(Vector3.left * rotation_velocity * Time.deltaTime);
			}
			
		} else {
			end_action();
		}
	}
}

function action()
{
	if (rotate_right)
	{
		target_rot = new Vector3(transform.eulerAngles.x, transform.eulerAngles.y, transform.eulerAngles.z + rotation_amount);
		//target_rot *= Quaternion.Euler(0, rotation_amount, 0);
		rotate_direction = 1;
		rotating_right = true;
		Debug.Log(target_rot);

	} else if (rotate_left)
	{
		//target_rot = new Vector2(curr_x - rotation_amount, curr_y);
		rotate_direction = -1;
		rotating_left = true;

	}



	rotate_action = true;
}

function end_action()
{
	Debug.Log("action COMPLETE!!!!");
	rotate_action = false;
	rotate_right = false;
	rotate_left = false;
	rotating_right = false;
	rotating_left = false;
	editable_base_script.puzzle_object_handler.action_completed();
}

function reset()
{
	//transform.rotation = original_rot;
	rotate_right = false;
	rotate_left = false;
	rotating_right = false;
	rotating_left = false;
}