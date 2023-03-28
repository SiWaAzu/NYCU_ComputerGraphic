#version 330 core
layout(location = 0) out vec4 normal;
layout(location = 1) out float height;

uniform float offset;

void main() {
  const float delta = 0.01;
  float x = gl_FragCoord.x;
  float y = gl_FragCoord.y;

  float x1 = x-delta;
  float x2 = x+delta;
  float y1 = y-delta;
  float y2 = y+delta;
  float z1 = sin(offset-0.1*y1);
  float z2 = sin(offset-0.1*y2);

  vec3 n1 = cross(vec3(0,y2-y1,z2-z1),vec3(x2-x1,0,0));
  vec3 n2 = cross(vec3(0,y1-y2,z1-z2),vec3(x1-x2,0,0));
  vec3 n =(n1+n2)/2;
  normal = vec4(n*0.5+0.5,1.0);
  // TODO: Generate the normal map.
  //   1. Get the position of the fragment. (screen space)
  //   2. Sample 4 points from combination of x +- delta, y +- delta
  //   3. Form at least 2 triangles from those points. Calculate their surface normal
  //   4. Average the surface normal, then tranform the normal [-1, 1] to RGB [0, 1]
  //   5. (Bonus) Output the H(x, y)
  // Note:
  //   1. Height at (x, y) = H(x, y) = sin(offset - 0.1 * y)
  //   2. A simple tranform from [-1, 1] to [0, 1] is f(x) = x * 0.5 + 0.5
  //normal = vec4(0.0, 0.0, 1.0, 1.0);
  height = sin(offset-0.1*y);
}
