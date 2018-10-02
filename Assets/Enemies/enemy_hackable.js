#pragma strict

// hack data
var num_parameters : int;
var parameter_type : String;
var parameter_0 : String;
var parameter_1 : String;
var parameter_2 : String;

var expected_return_int : int;
var expected_return_float : float;
var expected_return_str : String;
var expected_return_list : Array;
var return_type_int : boolean;
var return_type_float : boolean;
var return_type_str : boolean;
var return_type_list : boolean;
private var return_data;

var function_name : String;
var parameter_array : Array;
private var successful_hack : boolean = false;
private var hack_attempted : boolean = false;

// hack message
private var display_hack_message : boolean = false;
private var hack_message_timer : float = 3;
private var hack_timer_reset : float = hack_message_timer;
private var hack_success_txt : String = "Hack Success!";
private var hack_fail_txt : String = "Access Denied!";
private var hack_txt : String = hack_success_txt;
var hack_success_message : GameObject;
var hack_fail_message : GameObject;
var hack_message : GameObject;

// Pre:  This function is called upon impact of a physics enabled object. 
//       It's given a collision parameter with the collision information.
// Post: If the collision is with a function bullet from the player it runs its hack data 
//		 through the player's function. If the correct answer is returned it shuts down the robot.
function OnCollisionEnter2D (collision : Collision2D) 
{
	if (!hack_attempted)
	{
		// checks if the collision object is a function bullet
		if (collision.gameObject.tag == "function_bullet")
		{
			// assigns data to run in the function and runs the function
			if (num_parameters == 1)
			{
				parameter_array = new Array(parameter_0);

			} else if (num_parameters == 2)
			{
				parameter_array = new Array(parameter_0, parameter_1);

			} else if (num_parameters == 3)
			{
				parameter_array = new Array(parameter_0, parameter_1, parameter_2);

			} else
			{
				parameter_array = null;
			}

			
			// Run this test case through the player created function
			Framework.call_function_gun(parameter_array, function_name, 
										num_parameters, this.gameObject);

			Debug.Log("attempted run");
		}
	}
	
}

function check_return_data(return_data)
{
	if (return_data != null)
	{
		// checks returned value for correctness
		if (return_type_int)
		{
			if (return_data == expected_return_int)
				successful_hack = true;

		} else if (return_type_float)
		{
			if (return_data == expected_return_float)
				successful_hack = true;

		} else if (return_type_str)
		{
			if (return_data == expected_return_str)
				successful_hack = true;
			
		} else if (return_type_list)
		{
			if (return_data == expected_return_list)
				successful_hack = true;			
		}
	}
	

	var message_placement : Vector2 = new Vector2(transform.position.x, 
													  transform.position.y + 1.1);

	if (successful_hack)
	{
		GetComponent.<robot_enemy>().hack_attempt(true);
		//Framework.object_hacked(this.gameObject);
		hack_message = Instantiate(hack_success_message, message_placement, Quaternion.identity) as GameObject;

	} else {
		GetComponent.<robot_enemy>().hack_attempt(false);
		hack_message = Instantiate(hack_fail_message, message_placement, Quaternion.identity) as GameObject;
	}

	hack_attempted = true;

	Destroy(hack_message, 3);
}