#pragma strict

var is_attached : boolean = true;

function Update () 
{
	if (!is_attached)
	{
		transform.parent = null;

		if (GetComponent.<Rigidbody2D>() == null)
			this.gameObject.AddComponent.<Rigidbody2D>();
		//transform.position.y -= 1 * Time.deltaTime;
	}
}