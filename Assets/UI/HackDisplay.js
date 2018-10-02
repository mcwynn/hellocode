#pragma strict

var puzzle_obj : GameObject;
var name_obj : GameObject;
var x_obj : GameObject;
var y_obj : GameObject;
var commands_obj : GameObject;
var commands_txt_obj : GameObject;
var energy_level_box : GameObject;
var energy_level_bg : GameObject;

var energy_level : float = 100;
private var curr_shown_energy_level : float = 100;

private var command_shown : boolean = true;
private var PPU : float = 100;
private var curr_x : float;
private var curr_y : float;

function assign_text_info(parent_obj : GameObject, name : String, methods : String)
{
	// make the hack display a child of the puzzle object
	puzzle_obj = parent_obj;

	// check if the object uses energy, hide energy display if it doesn't
	if (!puzzle_obj.GetComponent.<Editable>().uses_energy)
	{
		energy_level_bg.SetActive(false);
		energy_level_box.SetActive(false);
	}

	// give the hack display the correct text to show object name and commands
	name_obj.GetComponent.<Text>().text = name;

	//commands_obj = transform.Find("command_box").gameObject;
	commands_txt_obj.GetComponent.<Text>().text = methods;
	toggle_commands();

	// give the hack display the current object position
	x_obj.GetComponent.<Text>().text = (puzzle_obj.transform.position.x * PPU).ToString();
	y_obj.GetComponent.<Text>().text = (puzzle_obj.transform.position.y * PPU).ToString();
}

function Update () 
{
	// get the current position of the parent puzzle object
	curr_x = puzzle_obj.transform.position.x;
	curr_y = puzzle_obj.transform.position.y;
	
	// update display for the player to see current coordinates
	x_obj.GetComponent.<Text>().text = (curr_x * PPU).ToString();
	y_obj.GetComponent.<Text>().text = (curr_y * PPU).ToString();

	// update energy level bar
	if (energy_level != curr_shown_energy_level)
	{
		energy_level_bg.transform.localScale = new Vector3(energy_level / 100, 1, 1);
		curr_shown_energy_level = energy_level;
	}

	// update the display's position to follow any movement from the parent puzzle object
	transform.position = new Vector2(curr_x, curr_y);
}

function toggle_commands()
{
	if (!command_shown)
	{
		commands_obj.SetActive(true);
		command_shown = true;

	} else {
		commands_obj.SetActive(false);
		command_shown = false;
	}
}
