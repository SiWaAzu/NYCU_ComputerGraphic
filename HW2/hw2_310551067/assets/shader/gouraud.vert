#version 330 core
// x, y, z
layout(location = 0) in vec3 Position_in;
// x, y, z
layout(location = 1) in vec3 Normal_in;
// u, v
layout(location = 2) in vec2 TextureCoordinate_in;
// Hint: Gouraud shading calculates per vertex color, interpolate in fs
// You may want to add some out here
out vec3 rawPosition;
out vec2 TextureCoordinate;
out float vertexLight;

// Uniform blocks
// https://www.khronos.org/opengl/wiki/Interface_Block_(GLSL)

layout (std140) uniform model {
  // Model matrix
  mat4 modelMatrix;
  // mat4(inverse(transpose(mat3(modelMatrix)))), precalculate using CPU for efficiency
  mat4 normalMatrix;
};

layout (std140) uniform camera {
  // Camera's projection * view matrix
  mat4 viewProjectionMatrix;
  // Position of the camera
  vec4 viewPosition;
};

layout (std140) uniform light {
  // Light's projection * view matrix
  // Hint: If you want to implement shadow, you may use this.
  mat4 lightSpaceMatrix;
  // Position or direction of the light
  vec4 lightVector;
  // inner cutoff, outer cutoff, isSpotlight, isDirectionalLight
  vec4 coefficients;
};

// precomputed shadow
// Hint: You may want to uncomment this to use shader map texture.
uniform sampler2DShadow shadowMap;


void main() {
  TextureCoordinate = TextureCoordinate_in;
  rawPosition = mat3(modelMatrix) * Position_in;
  float shadow = texture(shadowMap,-rawPosition);
  vertexLight=1;

  // Ambient intensity
  float ambient = 0.1;
  float ks = 0.75;
  float kd = 0.75;

  float diffuse;
  float specular;

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
  // Example without lighting :)
  if (coefficients[2]==1){
    //spotLight
    vec3 Lpos = vec3(viewPosition[0],viewPosition[1],viewPosition[2]); 
    vec4 V_tmp = modelMatrix*vec4(Position_in,1.0);
    vec3 V = vec3(V_tmp[0],V_tmp[1],V_tmp[2]);
    vec4 tmp = vec4(0.0,0.0,-1.0,0.0);
    vec3 L=normalize(vec3(lightVector[0],lightVector[1],lightVector[2]));
    vec4 N_tmp =normalMatrix*vec4(Normal_in,1.0);
    vec3 N = normalize(vec3(N_tmp[0],N_tmp[1],N_tmp[2]));
    vec3 E = normalize(vec3(viewPosition[0],viewPosition[1],viewPosition[2])-V);
    vec3 R = normalize(-reflect(-L,N));

    float d = distance(Lpos,V);
    
    float attenuation = 1/(1+0.014*d+0.0007*d*d);

    float specular =0.0;
    float diffuse =0.0;

    vec3 LtV = normalize(V-Lpos);

    if (dot(LtV,L)<coefficients[1]) vertexLight=ambient;
    else if (dot(LtV,L)>coefficients[0]){
      diffuse = kd*max(dot(N,-L),0.0);
      specular = ks*pow(max(dot(R,E),0.0),8.0);
      vertexLight = ambient+attenuation*(diffuse+specular);
    }
    else{
      diffuse = kd*max(dot(N,-L),0.0);
      specular = ks*pow(max(dot(R,E),0.0),8.0);
      vertexLight = ambient+pow(dot(LtV,L),50)*attenuation*(diffuse+specular);
    }

    //vec4 tmp = viewProjectionMatrix()*vec4(0,0,-1,0);



  }
  else if (coefficients[3]==1){
    //direction Light
    vec3 lightDir = normalize(vec3(lightVector[0],lightVector[1],lightVector[2]));
    vec4 N_tmp = normalMatrix*vec4(Normal_in,1.0);
    vec3 N = normalize(vec3(N_tmp[0],N_tmp[1],N_tmp[2]));
    vec4 V_tmp = modelMatrix*vec4(Position_in[0],Position_in[1],Position_in[2],1.0);
    vec3 V = vec3(V_tmp[0],V_tmp[1],V_tmp[2]);
    vec3 E = normalize(vec3(viewPosition[0],viewPosition[1],viewPosition[2])-V);
    vec3 R = normalize(-reflect(lightDir,N));

    diffuse = kd*max(dot(N,lightDir),0.0);
    specular = ks*pow(max(dot(R,E),0.0),8.0);

    vertexLight = ambient+(diffuse+specular);

   //vertexLight = 0;
  }
  else{
    //pointLight
    vec4 V_tmp = modelMatrix*vec4(Position_in,1.0);
    vec3 V = vec3(V_tmp[0],V_tmp[1],V_tmp[2]);
    vec3 pos = vec3(lightVector[0],lightVector[1],lightVector[2]);
    vec4 N_tmp =normalMatrix*vec4(Normal_in,1.0);
    vec3 N = normalize(vec3(N_tmp[0],N_tmp[1],N_tmp[2]));
    vec3 L = normalize(pos-V);
    vec3 E = normalize(vec3(viewPosition[0],viewPosition[1],viewPosition[2])-V);
    vec3 R = normalize(-reflect(L,N));

    diffuse =kd*max(dot(N,L),0.0);
    specular = ks*pow(max(dot(R,E),0.0),8.0);

    float d = distance(pos,V);
    
    float attenuation = 1/(1+0.027*d+0.0028*d*d);

    vertexLight = ambient + attenuation*(diffuse+specular);
    
  }

  gl_Position = viewProjectionMatrix * modelMatrix * vec4(Position_in, 1.0);
}
