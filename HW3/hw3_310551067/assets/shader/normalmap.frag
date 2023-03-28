#version 330 core
layout(location = 0) out vec4 FragColor;

in VS_OUT {
  vec3 position;
  vec3 lightDirection;
  vec2 textureCoordinate;
  flat vec3 viewPosition;
} fs_in;

uniform bool useParallaxMapping;
// RGB contains the color
uniform sampler2D diffuseTexture;
// RGB contains the normal
uniform sampler2D normalTexture;
// R contains the height
// TODO (Bonus-Parallax): You may need these if you want to implement parallax mapping.
uniform sampler2D heightTexture;
float depthScale = 0.01;

vec2 parallaxMapping(vec2 textureCoordinate, vec3 viewDirection)
{
  // number of depth layers
  const float minLayers = 8;
  const float maxLayers = 32;
  // TODO (Bonus-Parallax): Implement parallax occlusion mapping.
  // Hint: You need to return a new texture coordinate.
  // Note: The texture is 'height' texture, you may need a 'depth' texture, which is 1 - height.
  return textureCoordinate;
}

void main() {
  vec3 viewDirectionection = normalize(fs_in.viewPosition - fs_in.position);
  vec2 textureCoordinate = useParallaxMapping ? parallaxMapping(fs_in.textureCoordinate, viewDirectionection) : fs_in.textureCoordinate;
  if(useParallaxMapping && (textureCoordinate.x > 1.0 || textureCoordinate.y > 1.0 || textureCoordinate.x < 0.0 || textureCoordinate.y < 0.0))
    discard;
  // Query diffuse texture
  vec3 diffuseColor = texture(diffuseTexture, textureCoordinate).rgb;
  // Ambient intensity
  float ambient = 0.1;
  float diffuse = 0.1;
  float specular = 0.1;
  // TODO: Blinn-Phong shading
  //   1. Query normalTexture using to find this fragment's normal
  //   2. Convert the value from RGB [0, 1] to normal [-1, 1], this will be inverse of what you do in calculatenormal.frag's output.
  //   3. Remember to NORMALIZE it again.
  //   4. Use Blinn-Phong shading here with parameters ks = kd = 0.75
  vec4 normal = texture(normalTexture,textureCoordinate);
  vec4 tmp = normalize((normal-0.5)/5);
  normal = tmp;
  diffuse = 0.75*max(dot(fs_in.lightDirection,vec3(normal)),0.0);
  vec3 viewDir =normalize(fs_in.position-fs_in.viewPosition);
  vec3 halfway = normalize(fs_in.lightDirection + viewDir);
  specular = 0.75*pow(max(dot(normalize(vec3(normal)),halfway),0.0),8.0);

  
  float lighting = ambient + diffuse + specular;
  FragColor = vec4(lighting * diffuseColor, 1.0);
}
