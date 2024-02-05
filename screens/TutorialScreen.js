import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

const Dropdown = ({ title, description, codeSnippet }) => {
  
   
  const [modalVisible, setModalVisible] = useState(false);



  return (
    <View>
      

      <TouchableOpacity style={styles.dropdownButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.dropdownButtonText}>{title}</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView>
                <Text style={styles.categoryHeader}>{title}</Text>
              <Text style={styles.modalText}>{description}</Text>
              <Text style={styles.codeSnippet}>{codeSnippet}</Text>
              <View style={styles.buttonRow}>

              
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
              </View>
            
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const TutorialScreen = () => {
    const navigation = useNavigation();
    const shaderCategories = [
        {
            category: "Fragment Shader Examples",
            inputs: [
                {
                    title: 'Simple Color',
                    description: 'A basic fragment shader that sets every pixel to a static color. This example demonstrates the simplest possible shader, displaying how to output a single color across the entire rendered area.',
                    codeSnippet: `precision mediump float;
              
              void main() {
                  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
              }`,
                  },
                  {
                    title: 'Gradient Background',
                    description: 'This shader creates a vertical gradient by using the normalized y-coordinate of the fragment position. It showcases how to use the fragment coordinates to vary color smoothly across the screen.',
                    codeSnippet: `precision mediump float;
              
              uniform vec2 u_resolution;
              
              void main() {
                  vec2 uv = gl_FragCoord.xy / u_resolution;
                  vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), uv.y);
                  gl_FragColor = vec4(color, 1.0);
              }`,
                  },
                  {
                    title: 'Circle Pattern',
                    description: 'Generates a pattern of circles by calculating the distance from the center of the viewport and applying a modulo to create repeating circles.',
                    codeSnippet: `precision mediump float;
              
              uniform vec2 u_resolution;
              uniform float u_time;
              
              void main() {
                  vec2 center = u_resolution * 0.5;
                  vec2 uv = gl_FragCoord.xy - center;
                  float radius = mod(length(uv - center), 50.0);
                  float pattern = smoothstep(15.0, 20.0, radius);
                  gl_FragColor = vec4(vec3(pattern), 1.0);
              }`,
                  },
                  {
                    title: 'Noise Generation',
                    description: 'Introduces a simple way to generate a noise effect. This shader does not use a texture but simulates noise through a procedural method, which can be the basis for more complex effects.',
                    codeSnippet: `precision highp float;
              
              uniform float u_time;
              uniform vec2 u_resolution;
              
              float random (vec2 st) {
                  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
              }
              
              void main() {
                  vec2 uv = gl_FragCoord.xy/u_resolution.xy;
                  float noise = random(uv * u_time);
                  gl_FragColor = vec4(vec3(noise), 1.0);
              }`,
                  },
                  {
                    title: 'Ray Marching Basics',
                    description: 'An introductory example to ray marching in shaders, rendering a simple sphere. Ray marching is a technique used to render 3D objects and scenes directly in a fragment shader without geometry.',
                    codeSnippet: `precision highp float;
              
              uniform vec2 u_resolution;
              uniform float u_time;
              
              float sphere(vec3 rayOrigin, vec3 rayDir, float radius) {
                  float b = dot(rayOrigin, rayDir);
                  float c = dot(rayOrigin, rayOrigin) - radius * radius;
                  float d = b*b - c;
                  return d > 0.0 ? -b - sqrt(d) : -1.0;
              }
              
              void main() {
                  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
                  vec3 dir = normalize(vec3(uv, -1.0));
                  float dist = sphere(vec3(0.0, 0.0, 5.0), dir, 1.0);
                  vec3 color = dist > 0.0 ? vec3(1.0, 0.5, 0.0) : vec3(0.0);
                  gl_FragColor = vec4(color, 1.0);
              }`,
                  },
              {
                title: 'Color Oscillation and UV Coordinates',
                description: 'This fragment shader demonstrates how to use uniform variables and UV coordinates to create dynamic color effects. The `u_time` uniform is used to oscillate color values over time, creating an animated effect. The `u_resolution` uniform helps to normalize the `gl_FragCoord` coordinates to UV space, ensuring the effect scales correctly with the viewport size. The red and green colors oscillate out of sync due to a phase offset, creating a visually interesting pattern. The `uv.y` component is used directly in the final color to add a vertical gradient effect.',
                codeSnippet: `precision highp float;
          
          uniform vec2 u_resolution;
          uniform float u_time; 
          
          void main() {
              vec2 uv = gl_FragCoord.xy / u_resolution.xy;
              
              // Oscillating values between 0.0 and 1.0 based on u_time
              float red = 0.5 + 0.5 * sin(u_time);
              float green = 0.5 + 0.5 * sin(u_time + 3.14159);  // Pi phase offset to make it out of sync with red
          
              gl_FragColor = vec4(red, green, uv.y, 1.0);
          }`,
              },
              
              // Additional fragment shader examples can be added here
            ]
          },
          
          
        {
          category: "Shader Basics",
          inputs: [
            {
              title: 'vec3 vNormal',
              description: 'The normal vector of the surface, used for lighting calculations. It\'s a vector perpendicular to the surface at a given point, often used in lighting calculations to determine how light interacts with that surface.',
              codeSnippet: `// Vertex shader\nvarying vec3 vNormal;\n\nvoid main() {\n  vNormal = normalize(normalMatrix * normal);\n}`,
            },
            {
              title: 'Vertex Shader Basics',
              description: 'Vertex shaders process each vertexs properties, such as position and normal. They are responsible for setting the final position of vertices and passing data to fragment shaders.',
              codeSnippet: `// Vertex shader example\nattribute vec3 position;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}`,
            },
            {
              title: 'Fragment Shader Basics',
              description: 'Fragment shaders calculate the color of each pixel. They run for every pixel that will be rendered to the screen, determining the final color based on various inputs.',
              codeSnippet: `// Fragment shader example\nprecision mediump float;\nuniform vec4 color;\n\nvoid main() {\n  gl_FragColor = color;\n}`,
            },
            {
                title: 'mat4 modelViewMatrix',
                description: 'The model view matrix transforms vertices from model space to view space. It combines the model matrix and the view matrix into a single matrix.',
                codeSnippet: `// Vertex shader\nuniform mat4 modelViewMatrix;\nattribute vec3 position;\n\nvoid main() {\n  gl_Position = modelViewMatrix * vec4(position, 1.0);\n}`,
              },
              {
                title: 'mat4 projectionMatrix',
                description: 'The projection matrix is used to project the scene onto a 2D viewport. This matrix defines the field of view, aspect ratio, and near and far clipping planes.',
                codeSnippet: `// Vertex shader\nuniform mat4 projectionMatrix;\n\nvoid main() {\n  gl_Position = projectionMatrix * gl_Position;\n}`,
              },
          ]
        },
        {
          category: "Animation and Color",
          inputs: [
            {
              title: 'Animating with Time',
              description: 'Using the `time` uniform, animations can be created by modifying properties over time. This technique is useful for creating dynamic visual effects.',
              codeSnippet: `// Fragment shader\nuniform float time;\n\nvoid main() {\n  float red = sin(time) * 0.5 + 0.5;\n  gl_FragColor = vec4(red, 0.0, 0.0, 1.0);\n}`,
            },
            {
              title: 'Using Colors in Shaders',
              description: 'Colors in shaders are often represented as vec3 or vec4 for RGB or RGBA values, respectively. These can be used to dynamically adjust the color output of shaders.',
              codeSnippet: `// Fragment shader\nvoid main() {\n  vec3 color = vec3(1.0, 0.5, 0.0); // Orange\n  gl_FragColor = vec4(color, 1.0);\n}`,
            },
            {
              title: 'Color Gradients',
              description: 'You can create smooth color gradients in fragment shaders by using the fragment’s position or other factors. This is useful for backgrounds, visual effects, or UI elements.',
              codeSnippet: `// Fragment shader\nvoid main() {\n  vec2 position = gl_FragCoord.xy / screenResolution.xy;\n  vec3 color = mix(vec3(1, 0, 0), vec3(0, 0, 1), position.x);\n  gl_FragColor = vec4(color, 1.0);\n}`,
            },
            {
                title: 'GLSL Structs for Organizing Data',
                description: 'Structs in GLSL can organize data within shaders, making it easier to pass complex data structures between shaders.',
                codeSnippet: `// Vertex shader\nstruct LightInfo {\n  vec3 position;\n  vec3 color;\n  float intensity;\n};\n\nuniform LightInfo myLight;\n\nvoid main() {\n  // Use myLight...\n}`,
              },
              {
                title: 'Noise and Patterns',
                description: 'Generating procedural noise or patterns in fragment shaders can create various effects like textures, fog, or transitions. Here’s a simple example of generating a striped pattern.',
                codeSnippet: `// Fragment shader\nvoid main() {\n  float stripes = sin(gl_FragCoord.x * 0.1);\n  gl_FragColor = vec4(vec3(stripes), 1.0);\n}`,
              },
          ]
        },
        {
          category: "Texturing and Lighting",
          inputs: [
            {
              title: 'Texture Sampling',
              description: 'Texture sampling in fragment shaders allows you to apply and manipulate textures on surfaces. By using texture coordinates (UVs) passed from the vertex shader, you can fetch the color of a texture at any point, enabling detailed surface appearances.',
              codeSnippet: `// Fragment shader\nuniform sampler2D myTexture;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_FragColor = texture2D(myTexture, vTexCoord);\n}`,
            },
            {
              title: 'Lighting Calculations',
              description: 'Lighting is crucial for adding realism to scenes. Fragment shaders can calculate lighting by considering the surface normal, light direction, and material properties. This example demonstrates a basic diffuse lighting model.',
              codeSnippet: `// Fragment shader\nvarying vec3 vNormal;\nuniform vec3 lightDirection;\nuniform vec4 lightColor;\n\nvoid main() {\n  float diff = max(dot(normalize(vNormal), normalize(lightDirection)), 0.0);\n  gl_FragColor = diff * lightColor;\n}`,
            },
            {
                title: 'Screen Space Effects',
                description: 'Fragment shaders can operate on screen space coordinates to apply post-processing effects like blurs, color corrections, or screen overlays. This example illustrates a basic vignette effect.',
                codeSnippet: `// Fragment shader\nvarying vec2 vTexCoord;\nvoid main() {\n  vec3 color = texture2D(inputTexture, vTexCoord).rgb;\n  float border = smoothstep(0.4, 0.5, distance(vTexCoord, vec2(0.5, 0.5)));\n  gl_FragColor = vec4(mix(color, vec3(0), border), 1.0);\n}`,
              },
          ]
        },
        {
          category: "Special Effects",
          inputs: [
            // Inputs related to Dynamic Reflections, Refraction Effects, Shadow Mapping, etc.
            {
                title: 'Dynamic Reflections',
                description: 'Reflections add realism to scenes by simulating the way surfaces reflect light and surrounding objects. Using cube maps or environment maps, fragment shaders can calculate dynamic reflections based on surface properties and viewer position.',
                codeSnippet: `// Fragment shader\nuniform samplerCube envMap;\nvarying vec3 vReflect;\nvoid main() {\n  gl_FragColor = textureCube(envMap, normalize(vReflect));\n}`,
              },
              {
                title: 'Refraction Effects',
                description: 'Refraction occurs when light passes through transparent materials, bending in response to the material\'s index of refraction. This effect can simulate glass or water-like materials in shaders.',
                codeSnippet: `// Fragment shader\nuniform sampler2D background;\nuniform float refractionRatio;\nvarying vec3 vRefract;\nvoid main() {\n  vec3 refracted = refract(normalize(vRefract), normalize(vNormal), refractionRatio);\n  gl_FragColor = texture2D(background, refracted.xy + 0.5);\n}`,
              },
              {
                title: 'Shadow Mapping',
                description: 'Shadows add depth and realism to scenes. Shadow mapping involves rendering a scene from the light\'s perspective to create a depth map, then using this map in a fragment shader to determine whether a fragment is in shadow.',
                codeSnippet: `// Fragment shader\nuniform sampler2D shadowMap;\nvarying vec4 vShadowCoord;\nfloat shadow = texture2D(shadowMap, vShadowCoord.xy).r < vShadowCoord.z ? 0.5 : 1.0;\nvoid main() {\n  gl_FragColor = vec4(vec3(shadow), 1.0);\n}`,
              },
              {
                title: 'Bump Mapping',
                description: 'Bump mapping simulates small-scale surface detail by perturbing the surface normal based on a texture. This technique can add perceived depth and texture to surfaces without increasing geometric complexity.',
                codeSnippet: `// Fragment shader\nuniform sampler2D bumpMap;\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvoid main() {\n  vec3 normal = normalize(vNormal + texture2D(bumpMap, vTexCoord).xyz - 0.5);\n  gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);\n}`,
              },
              {
                title: 'Cel Shading (Toon Shading)',
                description: 'Cel shading is a non-photorealistic rendering technique that creates flat areas of color with hard edges, mimicking the style of comic books and cartoons. This effect can be achieved by quantizing the light contribution in a fragment shader.',
                codeSnippet: `// Fragment shader\nvarying vec3 vNormal;\nuniform vec3 lightDirection;\nvoid main() {\n  float intensity = max(dot(normalize(vNormal), lightDirection), 0.0);\n  int level = intensity > 0.95 ? 1 : intensity > 0.5 ? 2 : 3;\n  vec3 color = vec3(level * 0.33);\n  gl_FragColor = vec4(color, 1.0);\n}`,
              },
          ]
        },
        {
          category: "Optimization Techniques",
          inputs: [
            {
              title: 'Optimizations and Performance',
              description: 'Optimizing fragment shaders is crucial for performance, especially on mobile devices. Techniques include minimizing texture lookups, reducing conditional statements, and using low precision where possible.',
              codeSnippet: `// Example of optimization\nprecision mediump float;\nuniform sampler2D myTexture;\nvarying vec2 vTexCoord;\nvoid main() {\n  vec4 color = texture2D(myTexture, vTexCoord);\n  gl_FragColor = color.rgba;\n}`,
            },
            {
                title: 'Particle Systems and Effects',
                description: 'Fragment shaders can be used to render dynamic particle systems, providing the capability for realistic simulations of fire, smoke, water, and more. By manipulating points in a shader, complex, animated effects can be created.',
                codeSnippet: `// Fragment shader for particles\nuniform sampler2D particleTexture;\nvarying vec2 vTexCoord;\nvoid main() {\n  vec4 texColor = texture2D(particleTexture, vTexCoord);\n  gl_FragColor = texColor * gl_Color;\n}`,
              },
          ]
        },
        // Add more categories and inputs as needed
      ];
      
      



  const shaderInputs = [
    {
        title: 'vec3 vNormal',
        description: 'The normal vector of the surface, used for lighting calculations. It\'s a vector perpendicular to the surface at a given point, often used in lighting calculations to determine how light interacts with that surface.',
        codeSnippet: `// Vertex shader\nvarying vec3 vNormal;\n\nvoid main() {\n  vNormal = normalize(normalMatrix * normal);\n}`,
      },
      // Additional concepts
      {
        title: 'mat4 modelViewMatrix',
        description: 'The model view matrix transforms vertices from model space to view space. It combines the model matrix and the view matrix into a single matrix.',
        codeSnippet: `// Vertex shader\nuniform mat4 modelViewMatrix;\nattribute vec3 position;\n\nvoid main() {\n  gl_Position = modelViewMatrix * vec4(position, 1.0);\n}`,
      },
      {
        title: 'mat4 projectionMatrix',
        description: 'The projection matrix is used to project the scene onto a 2D viewport. This matrix defines the field of view, aspect ratio, and near and far clipping planes.',
        codeSnippet: `// Vertex shader\nuniform mat4 projectionMatrix;\n\nvoid main() {\n  gl_Position = projectionMatrix * gl_Position;\n}`,
      },
      {
        title: 'Vertex Shader Basics',
        description: 'Vertex shaders process each vertexs properties, such as position and normal. They are responsible for setting the final position of vertices and passing data to fragment shaders.',
        codeSnippet: `// Vertex shader example\nattribute vec3 position;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n}`,
      },
      {
        title: 'Fragment Shader Basics',
        description: 'Fragment shaders calculate the color of each pixel. They run for every pixel that will be rendered to the screen, determining the final color based on various inputs.',
        codeSnippet: `// Fragment shader example\nprecision mediump float;\nuniform vec4 color;\n\nvoid main() {\n  gl_FragColor = color;\n}`,
      },
      {
        title: 'Animating with Time',
        description: 'Using the `time` uniform, animations can be created by modifying properties over time. This technique is useful for creating dynamic visual effects.',
        codeSnippet: `// Fragment shader\nuniform float time;\n\nvoid main() {\n  float red = sin(time) * 0.5 + 0.5;\n  gl_FragColor = vec4(red, 0.0, 0.0, 1.0);\n}`,
      },
      {
        title: 'Using Colors in Shaders',
        description: 'Colors in shaders are often represented as vec3 or vec4 for RGB or RGBA values, respectively. These can be used to dynamically adjust the color output of shaders.',
        codeSnippet: `// Fragment shader\nvoid main() {\n  vec3 color = vec3(1.0, 0.5, 0.0); // Orange\n  gl_FragColor = vec4(color, 1.0);\n}`,
      },
      {
        title: 'GLSL Structs for Organizing Data',
        description: 'Structs in GLSL can organize data within shaders, making it easier to pass complex data structures between shaders.',
        codeSnippet: `// Vertex shader\nstruct LightInfo {\n  vec3 position;\n  vec3 color;\n  float intensity;\n};\n\nuniform LightInfo myLight;\n\nvoid main() {\n  // Use myLight...\n}`,
      },
      {
        title: 'Texture Sampling',
        description: 'Texture sampling in fragment shaders allows you to apply and manipulate textures on surfaces. By using texture coordinates (UVs) passed from the vertex shader, you can fetch the color of a texture at any point, enabling detailed surface appearances.',
        codeSnippet: `// Fragment shader\nuniform sampler2D myTexture;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  gl_FragColor = texture2D(myTexture, vTexCoord);\n}`,
      },
      {
        title: 'Lighting Calculations',
        description: 'Lighting is crucial for adding realism to scenes. Fragment shaders can calculate lighting by considering the surface normal, light direction, and material properties. This example demonstrates a basic diffuse lighting model.',
        codeSnippet: `// Fragment shader\nvarying vec3 vNormal;\nuniform vec3 lightDirection;\nuniform vec4 lightColor;\n\nvoid main() {\n  float diff = max(dot(normalize(vNormal), normalize(lightDirection)), 0.0);\n  gl_FragColor = diff * lightColor;\n}`,
      },
      {
        title: 'Color Gradients',
        description: 'You can create smooth color gradients in fragment shaders by using the fragment’s position or other factors. This is useful for backgrounds, visual effects, or UI elements.',
        codeSnippet: `// Fragment shader\nvoid main() {\n  vec2 position = gl_FragCoord.xy / screenResolution.xy;\n  vec3 color = mix(vec3(1, 0, 0), vec3(0, 0, 1), position.x);\n  gl_FragColor = vec4(color, 1.0);\n}`,
      },
      {
        title: 'Noise and Patterns',
        description: 'Generating procedural noise or patterns in fragment shaders can create various effects like textures, fog, or transitions. Here’s a simple example of generating a striped pattern.',
        codeSnippet: `// Fragment shader\nvoid main() {\n  float stripes = sin(gl_FragCoord.x * 0.1);\n  gl_FragColor = vec4(vec3(stripes), 1.0);\n}`,
      },
      {
        title: 'Screen Space Effects',
        description: 'Fragment shaders can operate on screen space coordinates to apply post-processing effects like blurs, color corrections, or screen overlays. This example illustrates a basic vignette effect.',
        codeSnippet: `// Fragment shader\nvarying vec2 vTexCoord;\nvoid main() {\n  vec3 color = texture2D(inputTexture, vTexCoord).rgb;\n  float border = smoothstep(0.4, 0.5, distance(vTexCoord, vec2(0.5, 0.5)));\n  gl_FragColor = vec4(mix(color, vec3(0), border), 1.0);\n}`,
      },
      {
        title: 'Fragment Position Manipulation',
        description: 'While fragment shaders typically do not change the position of fragments, they can manipulate the perception of position through effects like displacement mapping or pseudo-3D effects.',
        codeSnippet: `// Fragment shader\nuniform sampler2D heightMap;\nvarying vec2 vTexCoord;\n\nvoid main() {\n  float height = texture2D(heightMap, vTexCoord).r;\n  vec3 displacedColor = vec3(height);\n  gl_FragColor = vec4(displacedColor, 1.0);\n}`,
      },
      {
        title: 'Dynamic Reflections',
        description: 'Reflections add realism to scenes by simulating the way surfaces reflect light and surrounding objects. Using cube maps or environment maps, fragment shaders can calculate dynamic reflections based on surface properties and viewer position.',
        codeSnippet: `// Fragment shader\nuniform samplerCube envMap;\nvarying vec3 vReflect;\nvoid main() {\n  gl_FragColor = textureCube(envMap, normalize(vReflect));\n}`,
      },
      {
        title: 'Refraction Effects',
        description: 'Refraction occurs when light passes through transparent materials, bending in response to the material\'s index of refraction. This effect can simulate glass or water-like materials in shaders.',
        codeSnippet: `// Fragment shader\nuniform sampler2D background;\nuniform float refractionRatio;\nvarying vec3 vRefract;\nvoid main() {\n  vec3 refracted = refract(normalize(vRefract), normalize(vNormal), refractionRatio);\n  gl_FragColor = texture2D(background, refracted.xy + 0.5);\n}`,
      },
      {
        title: 'Shadow Mapping',
        description: 'Shadows add depth and realism to scenes. Shadow mapping involves rendering a scene from the light\'s perspective to create a depth map, then using this map in a fragment shader to determine whether a fragment is in shadow.',
        codeSnippet: `// Fragment shader\nuniform sampler2D shadowMap;\nvarying vec4 vShadowCoord;\nfloat shadow = texture2D(shadowMap, vShadowCoord.xy).r < vShadowCoord.z ? 0.5 : 1.0;\nvoid main() {\n  gl_FragColor = vec4(vec3(shadow), 1.0);\n}`,
      },
      {
        title: 'Bump Mapping',
        description: 'Bump mapping simulates small-scale surface detail by perturbing the surface normal based on a texture. This technique can add perceived depth and texture to surfaces without increasing geometric complexity.',
        codeSnippet: `// Fragment shader\nuniform sampler2D bumpMap;\nvarying vec2 vTexCoord;\nvarying vec3 vNormal;\nvoid main() {\n  vec3 normal = normalize(vNormal + texture2D(bumpMap, vTexCoord).xyz - 0.5);\n  gl_FragColor = vec4(normal * 0.5 + 0.5, 1.0);\n}`,
      },
      {
        title: 'Cel Shading (Toon Shading)',
        description: 'Cel shading is a non-photorealistic rendering technique that creates flat areas of color with hard edges, mimicking the style of comic books and cartoons. This effect can be achieved by quantizing the light contribution in a fragment shader.',
        codeSnippet: `// Fragment shader\nvarying vec3 vNormal;\nuniform vec3 lightDirection;\nvoid main() {\n  float intensity = max(dot(normalize(vNormal), lightDirection), 0.0);\n  int level = intensity > 0.95 ? 1 : intensity > 0.5 ? 2 : 3;\n  vec3 color = vec3(level * 0.33);\n  gl_FragColor = vec4(color, 1.0);\n}`,
      },
      {
        title: 'Particle Systems and Effects',
        description: 'Fragment shaders can be used to render dynamic particle systems, providing the capability for realistic simulations of fire, smoke, water, and more. By manipulating points in a shader, complex, animated effects can be created.',
        codeSnippet: `// Fragment shader for particles\nuniform sampler2D particleTexture;\nvarying vec2 vTexCoord;\nvoid main() {\n  vec4 texColor = texture2D(particleTexture, vTexCoord);\n  gl_FragColor = texColor * gl_Color;\n}`,
      },
      {
        title: 'Optimizations and Performance',
        description: 'Optimizing fragment shaders is crucial for performance, especially on mobile devices. Techniques include minimizing texture lookups, reducing conditional statements, and using low precision where possible.',
        codeSnippet: `// Example of optimization\nprecision mediump float;\nuniform sampler2D myTexture;\nvarying vec2 vTexCoord;\nvoid main() {\n  vec4 color = texture2D(myTexture, vTexCoord);\n  gl_FragColor = color.rgba;\n}`,
      },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Learn about Shaders</Text>
      <View style={{position: 'absolute', top:60,left:25}}>
            
            <TouchableOpacity style={[{top:0}]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" type="material-community" size={30} color='#ffcc0c'style={{}}  />
        </TouchableOpacity>
            </View>
      <ScrollView style={styles.scrollView}>
        {shaderCategories.map((category, catIndex) => (
          <View key={catIndex}>
            <Text style={styles.categoryHeader}>{category.category}</Text>
            {category.inputs.map((input, inputIndex) => (
              <Dropdown key={inputIndex} title={input.title} description={input.description} codeSnippet={input.codeSnippet} />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    backgroundColor: '#121212', // Dark background
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF', // Light text for dark background
  },
  dropdownButton: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#444', // Darker border for button
    borderRadius: 5,
    width: 300,
    alignItems: 'center',
    backgroundColor: '#333', // Darker button background
  },
  dropdownButtonText: {
    color: '#FFFFFF', // Light text for dark background
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: '#222', // Dark background for modal
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#FFF', // Light shadow for contrast
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#2196F3', // Keep for visibility
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#FFF', // Light text for readability
  },
  codeSnippet: {
    backgroundColor: '#333',
    color: '#FFD700', // Gold color for code snippets
    padding: 10,
    borderRadius: 5,
    overflow: 'scroll',
  },
  categoryHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700', // Gold color for headers
    marginTop: 20,
    marginBottom: 10,
    paddingLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonViewCode: {
    backgroundColor: '#4CAF50', // Or another color that differentiates it from the close button
  },
});

export default TutorialScreen;
