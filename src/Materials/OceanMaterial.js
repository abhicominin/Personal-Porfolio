import { DoubleSide, RepeatWrapping, ShaderMaterial, TextureLoader, Uniform } from "three";
import * as OceanShaders from "../Shaders/OceanShaders.js";
import * as RimShaders from "../Shaders/RimShaders.js";
import { cameraForward } from "../MainFiles/Scene.js";
import { timeUniform } from "../MainFiles/Time.js";
import { SetSkyboxUniforms } from "./SkyboxMaterial.js";

// Sea Surface
export const surface = new ShaderMaterial();
// Rim Surface
export const waterrim = new ShaderMaterial();

export const volume = new ShaderMaterial();

export const object = new ShaderMaterial();
export const rimobject = new ShaderMaterial();

export const triplanar = new ShaderMaterial();

const normalMap1 = new Uniform(new TextureLoader().load("/images/waterNormal1.png"));
normalMap1.value.wrapS = RepeatWrapping;
normalMap1.value.wrapT = RepeatWrapping;
const normalMap2 = new Uniform(new TextureLoader().load("/images/waterNormal2.png"));
normalMap2.value.wrapS = RepeatWrapping;
normalMap2.value.wrapT = RepeatWrapping;


const spotLightSharpness = 10;

export const spotLightDistance = 300;
export const spotLightDistanceUniform = new Uniform(spotLightDistance);

const objectTexture = new TextureLoader().load("/images/white.jpg");
objectTexture.wrapS = RepeatWrapping;
objectTexture.wrapT = RepeatWrapping;

const landTexture = new TextureLoader().load("/images/sand.png");
landTexture.wrapS = RepeatWrapping;
landTexture.wrapT = RepeatWrapping;

const blendSharpness = 3;
const triplanarScale = 1;

export function Start()
{  
    // SeaSurface

    surface.vertexShader = OceanShaders.surfaceVertex;
    surface.fragmentShader = OceanShaders.surfaceFragment;
    surface.side = DoubleSide;
    surface.transparent = true;

    surface.uniforms = 
    {
        _Time: timeUniform,
        _NormalMap1: normalMap1,
        _NormalMap2: normalMap2
    };
    SetSkyboxUniforms(surface); 

    // RimSurface
    waterrim.vertexShader = RimShaders.surfaceVertex;
    waterrim.fragmentShader = RimShaders.surfaceFragment;
    waterrim.side = DoubleSide;
    waterrim.transparent = true;

    waterrim.uniforms = 
    {
        _Time: timeUniform,
        _NormalMap1: normalMap1,
        _NormalMap2: normalMap2
    };
    SetSkyboxUniforms(waterrim);

    
    volume.vertexShader = OceanShaders.volumeVertex;
    volume.fragmentShader = OceanShaders.volumeFragment;
    SetSkyboxUniforms(volume);
    
    object.vertexShader = OceanShaders.objectVertex;
    object.fragmentShader = OceanShaders.objectFragment;
    object.uniforms =
    {
        _MainTexture: new Uniform(objectTexture),
        _CameraForward: new Uniform(cameraForward),
        _SpotLightSharpness: new Uniform(spotLightSharpness),
        _SpotLightDistance: spotLightDistanceUniform
    };
    SetSkyboxUniforms(object);

    // Object shader from Rimmaterial
    rimobject.vertexShader = RimShaders.objectVertex;
    rimobject.fragmentShader = RimShaders.rimobjectFragment;
    rimobject.uniforms =
    {
        _MainTexture: new Uniform(objectTexture),
        _CameraForward: new Uniform(cameraForward),
        _SpotLightSharpness: new Uniform(spotLightSharpness),
        _SpotLightDistance: spotLightDistanceUniform
    };
    SetSkyboxUniforms(rimobject);

    triplanar.vertexShader = OceanShaders.triplanarVertex;
    triplanar.fragmentShader = OceanShaders.triplanarFragment;
    triplanar.uniforms =
    {
        _MainTexture: new Uniform(landTexture),
        _CameraForward: new Uniform(cameraForward),
        _BlendSharpness: new Uniform(blendSharpness),
        _Scale: new Uniform(triplanarScale),
        _SpotLightSharpness: new Uniform(spotLightSharpness),
        _SpotLightDistance: spotLightDistanceUniform
    };
    SetSkyboxUniforms(triplanar);
}