#pragma strict

import UnityEngine.SceneManagement;

var level : int = 0;
var stage : int = 0;
private var stage_completed : boolean = false;

function OnTriggerEnter2D(obj_collider : Collider2D)
{
	if (obj_collider.gameObject.tag == "player" && !stage_completed)
	{
		Debug.Log("level complete!");
		stage_completed = true;
		GameProgressHandler.complete_level(level, stage);
		//SceneManager.LoadScene(0);
	}
}