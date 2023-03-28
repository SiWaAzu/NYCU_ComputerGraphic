#version 330 core
layout(location = 0) out vec4 FragColor;

in vec2 TextureCoordinate;
in vec3 rawPosition;
in vec3 fragPos;
in vec3 N;
in vec4 LV;
in vec4 cof;
in vec3 ViewPos;

uniform sampler2D diffuseTexture;
uniform samplerCube diffuseCubeTexture;
// precomputed shadow
// Hint: You may want to uncomment this to use shader map texture.
// uniform sampler2DShadow shadowMap;
uniform int isCube;

void main() {
  float ambient = 0.1;
  float ks = 0.75;
  float kd = 0.75;

  float lighting = 1.0;
  float diffuse = 1.0;
  float specular = 1.0;

  vec4 diffuseTextureColor = texture(diffuseTexture, TextureCoordinate);
  vec4 diffuseCubeTextureColor = texture(diffuseCubeTexture, rawPosition);
  vec3 color = isCube == 1 ? diffuseCubeTextureColor.rgb : diffuseTextureColor.rgb;

  if (cof[2]==1){
    //spot
    vec3 lightDir = normalize(vec3(LV[0],LV[1],LV[2]));
    
    float d = distance(ViewPos,fragPos);
    
    float attenuation = 1/(1+0.014*d+0.0007*d*d);

    vec3 LtV = normalize(fragPos-ViewPos);
    
    if (dot(LtV,lightDir)<cof[1])  lighting=ambient;
    else if (dot(LtV,lightDir)>cof[0]){
      diffuse = kd*max(dot(-lightDir,normalize(N)),0.0);
      vec3 ViewDir = normalize(ViewPos-fragPos);
      vec3 halfway = normalize(-lightDir+ViewDir);
      specular = ks*pow(max(dot(normalize(N),halfway),0.0),8.0);

      lighting=ambient+pow(dot(LtV,lightDir),65)*attenuation*(diffuse+specular);
    }
    else{
      diffuse = kd*max(dot(-lightDir,normalize(N)),0.0);
      vec3 ViewDir = normalize(ViewPos-fragPos);
      vec3 halfway = normalize(-lightDir+ViewDir);
      specular = ks*pow(max(dot(normalize(N),halfway),0.0),8.0);

      lighting=ambient+pow(dot(LtV,lightDir),75)*attenuation*(diffuse+specular);
    }

  }
  else if (cof[3]==1){
    //direction
    vec3 lightDir = normalize(vec3(LV[0],LV[1],LV[2]));
    diffuse = kd*max(dot(lightDir,normalize(N)),0.0);
    vec3 ViewDir = normalize(ViewPos-fragPos);
    vec3 halfway = normalize(lightDir+ViewDir);
    specular = ks*pow(max(dot(normalize(N),halfway),0.0),8.0);

    lighting = ambient+diffuse+specular;
  }
  else{
    //point
    vec3 lightDir = normalize(vec3(LV[0],LV[1],LV[2])-fragPos);
    diffuse = kd*max(dot(lightDir,normalize(N)),0.0);
    vec3 ViewDir = normalize(ViewPos-fragPos);
    vec3 halfway = normalize(lightDir+ViewDir);
    specular = ks*pow(max(dot(normalize(N),halfway),0.0),8.0);
    float d = distance(fragPos,vec3(LV[0],LV[1],LV[2]));
    float attenuation = 1/(1+0.027*d+0.0028*d*d);

    lighting = ambient+attenuation*(diffuse+specular);

  }
  // TODO: vertex shader / fragment shader
  // Hint:
  //       1. how to write a vertex shader:
  //          a. The output is gl_Position and anything you want to pass to the fragment shader. (Apply matrix multiplication yourself)
  //       2. how to write a fragment shader:
  //          a. The output is FragColor (any var is OK)
  //       3. colors
  //          a. For point light & directional light, lighting = ambient + attenuation * shadow * (diffuse + specular)
  //          b. If you want to implement multiple light sources, you may want to use lighting = shadow * attenuation * (ambient + (diffuse + specular))
  //       4. attenuation
  //          a. spotlight & pointlight: see spec
  //          b. directional light = no
  //          c. Use formula from slides 'shading.ppt' page 20
  //       5. spotlight cutoff: inner and outer from coefficients.x and coefficients.y
  //       6. diffuse = kd * max(normal vector dot light direction, 0.0)
  //       7. specular = ks * pow(max(normal vector dot halfway direction), 0.0), 8.0);
  //       8. notice the difference of light direction & distance between directional light & point light
  //       9. we've set ambient & color for you
  FragColor = vec4(color*lighting, 1.0);
}
