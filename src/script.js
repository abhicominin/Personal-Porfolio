import * as TIME from "./MainFiles/Time.js";
import * as SCENE from "./MainFiles/Scene.js";
import * as SETTINGS from "./Shaders/Settings.js"

TIME.Start();
SETTINGS.Start();
SCENE.Start();


requestAnimationFrame(UpdateFrame);

function UpdateFrame()
{
    
    TIME.Update();
    SCENE.Update();
    requestAnimationFrame(UpdateFrame);
    
}