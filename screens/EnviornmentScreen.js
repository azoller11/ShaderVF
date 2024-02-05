import React, { useRef, useEffect, useState, version } from 'react';
import { GLView } from 'expo-gl';
import { mat4, mat3 } from 'gl-matrix';
import Slider from '@react-native-community/slider'; // or { Slider } from 'react-native' if using the built-in slider
import { Asset } from 'expo-asset';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,ScrollView, Button,TouchableWithoutFeedback, Keyboard,KeyboardAvoidingView  } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import CodeEditor, { CodeEditorSyntaxStyles } from '@rivascva/react-native-code-editor';
import { useKeyboard } from '@react-native-community/hooks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OBJLoader } from '../assets/OBJLoader';
import {GetAssets} from '../assets/GetAssets';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

const EnviornmentScreen = ({ route }) => {
  const navigation = useNavigation();
  const keyboard = useKeyboard();
  const insets = useSafeAreaInsets();
   const initialUniforms = {
  metallic: { type: "float", value: 0.9 },
  roughness: { type: "float", value: 0.3 },
  // Example of a vector3 uniform (e.g., light direction)
  lightDirection: { type: "vec3", value: [1.0, 1.0, 1.0] },
};


const dragStart = useRef({ x: 0, y: 0 });
const currentDrag = useRef({ x: 0, y: 0 });

// Inside your component
const userRotation = useRef({ x: 0, y: 0, z: 0.0 });
const isUserInteracting = useRef(false);
// Sensitivity factor for converting drag distance to rotation angle
const rotationSensitivity = 0.033; // Adjust this value based on your needs


const [key, setKey] = useState(0);

const [glContext, setGlContext] = useState(null);
//const [programContext, setProgramContext] = useState(null);

const [uniforms, setUniforms] = useState(initialUniforms);



const [shaderModalVisible, setShaderModalVisible] = useState(false);
const [fragShader, setFragShader] = useState(null); // Store the fragment shader reference
const [shaderUpdated, setShaderUpdated] = useState(false);
const fragShaderSrc = `
precision highp float;
varying vec3 vNormal;
varying vec2 vTexCoord; // Receive texture coordinate
uniform sampler2D uTexture; // Texture sampler
uniform vec2 u_resolution;
uniform float u_time;


void main() {
  vec3 light = normalize(vec3(1.0, 1.0, 1.0));
  float brightness = dot(vNormal, light) * 0.5 + 0.5;
  vec4 texColor = texture2D(uTexture, vTexCoord); // Sample texture
  gl_FragColor = texColor * vec4(brightness, brightness, brightness, 1.0);
}
`;

const [shaderCode, setShaderCode] = useState(route.params?.shader?.code ?? fragShaderSrc);





    

// Call this function to refresh the GLView
const refreshGLView = () => {
  setKey(prevKey => prevKey + 1);
};

const updateShaderCode = () => {
  /*
  if (!glContext) {
    console.error('WebGL context not available');
    return;
  }

  // Create and compile the new fragment shader
  const newFragShader = glContext.createShader(glContext.FRAGMENT_SHADER);
  glContext.shaderSource(newFragShader, shaderCode);
  glContext.compileShader(newFragShader);

  if (!glContext.getShaderParameter(newFragShader, glContext.COMPILE_STATUS)) {
    console.error('ERROR compiling fragment shader!', glContext.getShaderInfoLog(newFragShader));
    alert('Shader compilation failed! Check the console for errors.');
    return;
  }

  // Detach the old shader if it exists
  if (fragShader) {
    glContext.detachShader(program, fragShader);
    glContext.deleteShader(fragShader);
  }

  // Attach the new shader
  glContext.attachShader(program, newFragShader);
  glContext.linkProgram(program);

  if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
    console.error('ERROR linking program!', glContext.getProgramInfoLog(program));
    return;
  }

  // Use the program with the updated shader
  setShaderModalVisible(false); // Close the modal

  // Update the state with the new fragment shader
  setFragShader(newFragShader);
  setShaderUpdated(true);

  refreshGLView();

  */
  setShaderModalVisible(false); 
};


const handleTouchStart = (evt) => {
  isUserInteracting.current = true;
  const { locationX, locationY } = evt.nativeEvent;
  dragStart.current = { x: locationX, y: locationY };
 // console.log(`Touch start: ${locationX}, ${locationY}`);
};

const handleTouchMove = (evt) => {
  const { locationX, locationY } = evt.nativeEvent;
  currentDrag.current = { x: locationX, y: locationY };
  isUserInteracting.current = true;

  // Calculate rotation based on drag
  const deltaX = (currentDrag.current.x - dragStart.current.x) * rotationSensitivity;
  const deltaY = (currentDrag.current.y - dragStart.current.y) * rotationSensitivity;

  // Directly update the userRotation ref with the new values
  userRotation.current = {
    ...userRotation.current,
    x: userRotation.current.x + deltaY * rotationSensitivity,
    y: userRotation.current.y + deltaX * rotationSensitivity,
  };

  //console.log(`Touch move: ${locationX}, ${locationY}`);
 // console.log(`New rotation: X=${userRotation.current.x}, Y=${userRotation.current.y}, Z=${userRotation.current.z}`);
};

const handleTouchEnd = (evt) => {
  isUserInteracting.current = false;
  //console.log(`Touch end: X=${currentDrag.current.x}, Y=${currentDrag.current.y}`);
  //console.log(`Final rotation: X=${userRotation.current.x}, Y=${userRotation.current.y}, Z=${userRotation.current.z}`);
};


useEffect(() => {
  (async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
    }
  })();
}, []);






const loadTexture = async (gl, uri) => {
  
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const asset = Asset.fromModule(uri);
    await asset.downloadAsync();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, asset);

    return texture;
  
};


const Sphere = () => {

   OBJLoader.loadSphere().then(parsedData => {
    vertices = parsedData.vertices;
    normals = parsedData.normals;
    cubeIndices = parsedData.indices;
    textureCoordinates = parsedData.textureCoordinates;
    //refreshGLView();
   });
   
}
  
  
  const onContextCreate = async (gl) => {
    setGlContext(gl);
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vertShader,
      `attribute vec4 position;
      attribute vec3 normal;
      attribute vec2 texCoord;
      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;
      uniform mat3 normalMatrix;
      varying vec3 vNormal;
      varying vec2 vTexCoord; // Pass texture coordinate to fragment shader
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vTexCoord = texCoord;
        gl_Position = projectionMatrix * modelViewMatrix * position;
      }`
    );
    gl.compileShader(vertShader);

   

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(
      fragShader,shaderCode
    );
    gl.compileShader(fragShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    //setProgramContext(program);

    const vertices = new Float32Array([
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
      -1.0,  1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0,
    ]);

    const normals = new Float32Array([
      // Normals for each vertex (same order as the vertex definitions)
      // Front
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,
      0.0,  0.0,  1.0,

      // Back
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,
      0.0,  0.0, -1.0,

      // Top
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,
      0.0,  1.0,  0.0,

      // Bottom
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,
      0.0, -1.0,  0.0,

      // Right
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,
      1.0,  0.0,  0.0,

      // Left
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
      -1.0,  0.0,  0.0,
    ]);

    // Indices defining the triangles
    const cubeIndices = [
      0, 1, 2,     0, 2, 3,    // front
      4, 5, 6,     4, 6, 7,    // back
      8, 9, 10,    8, 10, 11,  // top
      12, 13, 14,  12, 14, 15, // bottom
      16, 17, 18,  16, 18, 19, // right
      20, 21, 22,  20, 22, 23  // left
    ];


    const textureCoordinates = new Float32Array([
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    
      // Back face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    
      // Top face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    
      // Bottom face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    
      // Right face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    
      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ]);
    

   

    const texture = await loadTexture(gl, require('../assets/icon.png')); // Replace with your image path
    const skybox = await loadTexture(gl, require('../assets/skybox.png'));
     
 

      // Check for shader compilation errors
  if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertShader));
    return;
  }
  if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
    console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragShader));
    alert(gl.getShaderInfoLog(fragShader));
    return;
  }

  // Check for program linking errors
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('ERROR linking program!', gl.getProgramInfoLog(program));
    return;
  }

    const normalAttribLocation = gl.getAttribLocation(program, 'normal');
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(normalAttribLocation);
    gl.vertexAttribPointer(normalAttribLocation, 3, gl.FLOAT, false, 0, 0);

    const positionAttribLocation = gl.getAttribLocation(program, 'position');
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);


    // Setup texture coordinates buffer
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, textureCoordinates, gl.STATIC_DRAW);
    const texCoordAttribLocation = gl.getAttribLocation(program, 'texCoord');
    gl.enableVertexAttribArray(texCoordAttribLocation);
    gl.vertexAttribPointer(texCoordAttribLocation, 2, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 45 * Math.PI / 180, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 100.0);

    let modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -16.0]);



    let previousTime = 0;



  const renderCube = (gl, program, texture, cubeIndices, projectionMatrix, modelViewMatrix, uniforms, time) => {
    // Bind the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'uTexture'), 0);

    // Set uniform values
    const utime = performance.now() / 1000.0; // Time in seconds
    const tint = [1.0, 0.5, 0.5]; // Example: red tint

    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), utime);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), gl.drawingBufferWidth, gl.drawingBufferHeight);

    gl.uniform3fv(gl.getUniformLocation(program, 'tint'), tint);
    gl.uniform3fv(gl.getUniformLocation(program, 'lightDirection'), [1.0, 1.0, 1.0]); // Example light direction
    gl.uniform3fv(gl.getUniformLocation(program, 'cameraPosition'), [0.0, 0.0, 5.0]); // Example camera position

    // Update uniforms based on provided uniforms object
    Object.entries(uniforms).forEach(([name, uniformData]) => {
      const location = gl.getUniformLocation(program, name);
      // Check the type of uniform to decide which method to use
      switch (uniformData.type) {
        case "float":
          gl.uniform1f(location, uniformData.value);
          break;
        case "vec2":
          gl.uniform2fv(location, uniformData.value);
          break;
        case "vec3":
          gl.uniform3fv(location, uniformData.value);
          break;
        case "vec4":
          gl.uniform4fv(location, uniformData.value);
          break;
        // Add more cases as needed
        default:
          console.warn(`Unhandled uniform type: ${uniformData.type}`);
      }
    });

    let scaledModelViewMatrix = mat4.create();
    mat4.copy(scaledModelViewMatrix, modelViewMatrix); // Copy the original modelViewMatrix
    const scale = [1.0, 1.0, 1.0]; // Example scale factor; change this to scale the cube
    mat4.scale(scaledModelViewMatrix, scaledModelViewMatrix, scale); // Apply scaling


    // Set matrices with the scaled matrix
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projectionMatrix'), false, projectionMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelViewMatrix'), false, scaledModelViewMatrix);

    // Calculate and set the normal matrix for the scaled cube
    let normalMatrix = mat4.create();
    mat4.invert(normalMatrix, scaledModelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    gl.uniformMatrix3fv(gl.getUniformLocation(program, 'normalMatrix'), false, mat3.normalFromMat4(mat3.create(), normalMatrix));

    // Clear the canvas and draw the cube
    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);
    

  };



    const animate = (time) => {
      const deltaTime = time - previousTime;
      previousTime = time;





      

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Black background

      //console.log(isUserInteracting);
      
      //renderSkybox(gl, program, skybox, cubeIndices, projectionMatrix, viewMatrix);
      gl.enable(gl.DEPTH_TEST);

      mat4.rotate(modelViewMatrix, modelViewMatrix, 0.00015 * deltaTime, [-1, 0.5, 1.5]);
      
      try {
        if (isUserInteracting) {
          //mat4.rotate(modelViewMatrix, modelViewMatrix, 0.0015 * deltaTime, [1, 1, 1]);
        }
        //console.log(userRotation.x);
        mat4.rotate(modelViewMatrix, modelViewMatrix, userRotation.current.x, [1, 0, 0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, userRotation.current.y, [0, 1, 0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, userRotation.current.z, [0, 0, 1]);
        userRotation.current.x = 0;
        userRotation.current.y = 0;
        userRotation.current.z = 0;
      } catch(e) {


      }
      

      renderCube(gl, program, texture, cubeIndices, projectionMatrix, modelViewMatrix, uniforms, time);


      gl.flush();

      // Request the next frame
      gl.endFrameEXP();
      
      requestAnimationFrame(animate);
    };

    gl.enable(gl.DEPTH_TEST);

    animate(0);
  };
  

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={true}>
      
    <View   style={{ flex: 1 }}>
     
   

      


      <GLView style={{ flex: 1 }} key={key} onContextCreate={onContextCreate} />
    
      <TouchableOpacity style={[styles.iconButton, {left:50}]} onPress={() => setShaderModalVisible(true)}>
          <Icon name="code" type="font-awesome" size={30} color='#3366CC'style={{}}  />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.iconButton, {left:0}]} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" type="material-community" size={30} color='#3366CC'style={{}}  />
      </TouchableOpacity>

      <View
        style={styles.controlBox}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        <Icon name="arrows" type="font-awesome" size={30} color='#3366CC'style={{}}  />
      </View>


{/* Modal for editing shader code*/}
<Modal
    visible={shaderModalVisible}
    onRequestClose={() => setShaderModalVisible(false)}
    animationType="slide"
    transparent={false}
    style={{ flex: 1 }}>
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
      <View style={styles.container}>

        {/* Buttons positioned absolutely at the top */}
        <View style={styles.buttonsContainer}>
          {/* Custom button component or use TouchableOpacity for more styling options */}
        
          <View style={styles.button}>
            <Button title="Close" onPress={() => setShaderModalVisible(false)} color="#FFFFFF" />
          </View>
        </View>

        {/* ScrollView to contain the CodeEditor */}
        <ScrollView style={styles.editorContainer}>
          <CodeEditor 
            initialValue={shaderCode}
            code={shaderCode}
            onChange={(newText) => setShaderCode(newText)}
            style={{
              fontSize: 15,
              inputLineHeight: 26,
              highlighterLineHeight: 26,
              color: '#FFFFFF', // Text color for dark mode
              backgroundColor: '#333333', // Editor background color for dark mode
              paddingTop: 60, // Adjust based on the size of your buttons
            }}
            language="glsl"
            syntaxStyle={CodeEditorSyntaxStyles.atomOneDark}
            showLineNumbers
          />
        </ScrollView>
        
      </View>
    </KeyboardAvoidingView>
  </Modal>




    </View>
    </TouchableWithoutFeedback>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', // Dark mode background color
  },
  buttonsContainer: {
    position: 'absolute',
    top: 30,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    flex: 1, // Ensure buttons are evenly spaced
    marginHorizontal: 10, // Adjust spacing between buttons
    top:10
  },
  editorContainer: {
    flex: 1,
    marginTop: 80, // Adjust based on the height of the button container
  },
  iconButton: {
    position: 'absolute',
    top: 50,  // Adjust as needed
    zIndex: 20,
  },
  controlBox: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 100, // Adjust the size of the control box as needed
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent
    borderRadius: 10,
  },
  
});

export default EnviornmentScreen;



/* wave fire shader

precision highp float;

      varying vec3 vNormal;
      varying vec2 vTexCoord;
      uniform sampler2D uTexture;
      uniform float time; // Time uniform for dynamic effects
      uniform vec3 tint; // Tint color uniform
      
      void main() {
          vec3 light = normalize(vec3(1.0, 1.0, 1.0));
      
          // Waving effect
          vec2 waveTexCoord = vTexCoord;
          waveTexCoord.x += sin(waveTexCoord.y * 10.0 + time) * 0.02;
          waveTexCoord.y += cos(waveTexCoord.x * 10.0 + time) * 0.02;
      
          // Base texture color
          vec4 texColor = texture2D(uTexture, waveTexCoord);
      
          // Invert colors
          texColor.rgb = 1.0 - texColor.rgb;
      
          // Apply brightness and tint
          float brightness = dot(vNormal, light) * 0.5 + 0.5;
          texColor.rgb = texColor.rgb * brightness * tint;
      
          // Rim lighting effect
          float rim = 1.0 - max(dot(vNormal, light), 0.0);
          rim = smoothstep(0.2, 1.0, rim);
          texColor.rgb += rim * 0.3; // Adjust the rim intensity
      
          gl_FragColor = texColor;
      }


*/

/* OG Shader

 precision highp float;
      varying vec3 vNormal;
      varying vec2 vTexCoord; // Receive texture coordinate
      uniform sampler2D uTexture; // Texture sampler
      uniform vec2 u_resolution;
      uniform float u_time;


      void main() {
        vec3 light = normalize(vec3(1.0, 1.0, 1.0));
        float brightness = dot(vNormal, light) * 0.5 + 0.5;
        vec4 texColor = texture2D(uTexture, vTexCoord); // Sample texture
        gl_FragColor = texColor * vec4(brightness, brightness, brightness, 1.0);
      }`


*/