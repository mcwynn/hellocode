#pragma strict

var error_line_num : int = 0;
var error_type : String = "";
var error_message : String = "";

var error_type_txt_box : GameObject;
var error_message_txt_box : GameObject;
var original_pos : Vector3;
private var line_spacing : float = 15;

function Start()
{
	original_pos = transform.position;
	this.gameObject.SetActive(false);
}

//
//
function show_error(type : String, message : String)
{
	error_type_txt_box.GetComponent.<Text>().text = type;
	error_message_txt_box.GetComponent.<Text>().text = message;
}

//
//
function reset()
{
	transform.localPosition = new Vector2(transform.localPosition.x, 
										  transform.localPosition.y + ((error_line_num - 1) * line_spacing));
	this.gameObject.SetActive(false);
}