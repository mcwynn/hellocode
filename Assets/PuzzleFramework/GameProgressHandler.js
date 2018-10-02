#pragma strict

public static class GameProgressHandler extends MonoBehaviour
{
	var initial_game_launch : boolean = true;

	// holds the player's game progress
	var level_0_progress : int = 0;

	// the current level and difficulty being played
	var current_level : int = 0;
	var current_stage : int = 0;

	// manage check points
	var checkPoints : Array = new Array();
	var checkPointPositions : Array = new Array();
	private var numLevels : int = 4;

	function initProgressHandler () {
		for (var i : int = 0; i < numLevels; i++) {
			checkPoints.Add(0);
		}

		for (var j : int = 0; j < numLevels; j++) {
			checkPointPositions.Add(new Vector2(0, 0));
		}
	}

	//
	//
	function complete_level(completed_level : int, completed_stage : int)
	{
		if (completed_level == 0)
		{
			if (completed_stage == 0)
				level_0_progress = 1;

			else if (completed_stage == 1)
				level_0_progress = 2;
			
		} else if (current_level == 1)
		{
			
			
		} else if (current_level == 2)
		{

			
		}
	}

	//
	//
	function updateCheckPoint (puzzleCompleted : int, position : Vector3) {
		checkPoints[current_level] = puzzleCompleted;
		checkPointPositions[current_level] = position;
	}

	//
	//
	function getCheckPoint () {
		return checkPoints[current_level];
	}

	//
	//
	function getCheckPointPosition () {
		return checkPointPositions[current_level];
	}


}