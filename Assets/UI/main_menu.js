#pragma strict

import UnityEngine.SceneManagement;

public function load_level(scene_num : int)
{
	SceneManager.LoadScene(scene_num);
}

function assign_level(level : int)
{
	GameProgressHandler.current_level = level;
}

function assign_stage(stage : int)
{
	GameProgressHandler.current_stage = stage;
}

function exit_game()
{
	Application.Quit();
}