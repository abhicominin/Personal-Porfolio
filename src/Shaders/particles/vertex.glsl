uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime; // Time uniform for the wave animation

attribute vec3 aPositionTarget;
attribute float aSize;

varying vec3 vColor;

#include ../includes/simplexNoise3d.glsl

void main()
{
    // Define wave parameters
    float waveStrength = 0.1; // Strength of the wave
    float waveSpeed = 2.0; // Speed of the wave
    float waveFrequency = 0.2; // Frequency of the wave

    // Apply wave effect to position
    vec3 waveOffsetPosition = vec3(
        sin(uTime * waveSpeed + position.x * waveFrequency) * waveStrength,
        cos(uTime * waveSpeed + position.y * waveFrequency) * waveStrength,
        0.0
    );
    vec3 wavyPosition = position + waveOffsetPosition;

    // Apply wave effect to aPositionTarget
    vec3 waveOffsetTarget = vec3(
        sin(uTime * waveSpeed + aPositionTarget.x * waveFrequency) * waveStrength,
        cos(uTime * waveSpeed + aPositionTarget.y * waveFrequency) * waveStrength,
        0.0
    );
    vec3 wavyPositionTarget = aPositionTarget + waveOffsetTarget;

    // Mixed position
    float noiseOrigin = simplexNoise3d(wavyPosition * 0.2);
    float noiseTarget = simplexNoise3d(wavyPositionTarget * 0.2);
    float noise = mix(noiseOrigin, noiseTarget, uProgress);
    noise = smoothstep(-1.0, 1.0, noise);

    float duration = 0.4;
    float delay = (1.0 - duration) * noise;
    float end = delay + duration;
    float progress = smoothstep(delay, end, uProgress);
    vec3 mixedPosition = mix(wavyPosition, wavyPositionTarget, progress);

    // Final position
    vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;

    // Point size
    gl_PointSize = aSize * uSize * uResolution.y;
    gl_PointSize *= (1.0 / - viewPosition.z);

    // Varyings
    vColor = mix(uColorA, uColorB, noise);
}
