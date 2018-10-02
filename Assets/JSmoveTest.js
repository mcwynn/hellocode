#pragma strict

import IronPython;

function python_script () {

	var engine = UnityPython.CreateEngine();
	var scope = engine.CreateScope();

	var move : int = 0;

	// This is the Python Script
	var code : String = "import UnityEngine\n";
	code += "import System.Collections\n";

	code += "move = 5\n";

	code += "UnityEngine.GameObject.Find('test_object').transform.Translate(1, 0, 0)";

	//transform.Translate(2, 0, 0);

	var source = engine.CreateScriptSourceFromString(code);
	source.Execute(scope);

	// This grabs the variable from the python script
	move = scope.GetVariable.<int>("move");

	Debug.Log (move);

}

function Update () {

	if (Input.GetMouseButtonDown(0)) {

		python_script();
	}

	if (Input.GetMouseButton (1)) {

		python_script ();

	}
}
