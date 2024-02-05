import React, { useState, useRef,useEffect } from 'react';
import { StyleSheet, View, TextInput, Button,  ScrollView, TouchableOpacity, Text } from 'react-native';
import { GLView } from 'expo-gl';
import { mat4, vec3 } from 'gl-matrix';
import AsyncStorage from '@react-native-async-storage/async-storage';


const vertShaderSrc = `
attribute vec4 position;
uniform mat4 modelViewProjection;
void main() {
  gl_Position = modelViewProjection * position;
}`;

const fragShaderSrc = `
precision mediump float;
uniform float u_time;
void main() {
  float r = 0.5 * (1.0 + sin(u_time));
  float g = 0.5 * (1.0 + cos(u_time));
  gl_FragColor = vec4(r, g, 0.3, 1.0);
}
`;


export default function Create3DScreen({ route }) {

  const [vertices, setVertices] = useState(new Float32Array([
    -0.5, -0.5, 0.5, 1.0,
    0.5, -0.5, 0.5, 1.0,
    0.5, 0.5, 0.5, 1.0,
    -0.5, 0.5, 0.5, 1.0,
    -0.5, -0.5, -0.5, 1.0,
    0.5, -0.5, -0.5, 1.0,
    0.5, 0.5, -0.5, 1.0,
    -0.5, 0.5, -0.5, 1.0,
  ])); 
  const [indices, setIndices] = useState(new Uint16Array([
    0, 1, 2, 0, 2, 3,  // front
    4, 5, 6, 4, 6, 7,  // back
    4, 5, 1, 4, 1, 0,  // bottom
    7, 6, 2, 7, 2, 3,  // top
    7, 4, 0, 7, 0, 3,  // left
    6, 5, 1, 6, 1, 2,  // right
  ])); 


  function drawShape(shape) {
    let v = new Float32Array([]);
    let i = new Uint16Array([]);
    switch (shape) {
      case 'cube':
        // draw cube
        v =new Float32Array([
          -0.5, -0.5, 0.5, 1.0,
          0.5, -0.5, 0.5, 1.0,
          0.5, 0.5, 0.5, 1.0,
          -0.5, 0.5, 0.5, 1.0,
          -0.5, -0.5, -0.5, 1.0,
          0.5, -0.5, -0.5, 1.0,
          0.5, 0.5, -0.5, 1.0,
          -0.5, 0.5, -0.5, 1.0,
        ]);
        i = new Uint16Array([
          0, 1, 2, 0, 2, 3,  // front
          4, 5, 6, 4, 6, 7,  // back
          4, 5, 1, 4, 1, 0,  // bottom
          7, 6, 2, 7, 2, 3,  // top
          7, 4, 0, 7, 0, 3,  // left
          6, 5, 1, 6, 1, 2,  // right
        ]);
        break;
      case 'pyramid':
        // draw triangle
        v = new Float32Array([
          0.0, 1.0, 0.0, 1.0,  // Top vertex
          -1.0, -1.0, 1.0, 1.0, // Bottom left vertex
          1.0, -1.0, 1.0, 1.0,  // Bottom right vertex
          0.0, -1.0, -1.0, 1.0, // Back vertex
      ])
        
      i = (new Uint16Array([
          0, 1, 2,  // Front face
          0, 2, 3,  // Right face
          0, 3, 1,  // Left face
          1, 3, 2,  // Bottom face
      ]));
        break;
     
      
      default:
        break;
    }
    setVertices(v);
    setIndices(i);
    updateBuffers(gl.current, v, i);
  }

  

  //////////Shader selector 
  const [shaderData, setShaderData] = useState([]);
  const [selectedShader, setSelectedShader] = useState(route.params.shader ? route.params.shader.code : fragShaderSrc);
  const changeShader = (newShaderCode) => setSelectedShader(newShaderCode);
  let changingShader = useRef(false);
  const programRef = useRef(null);
  // Fetch shaders from AsyncStorage on component mount
  useEffect(() => {
    const fetchShaders = async () => {
      const keys = await AsyncStorage.getAllKeys();
      const fetchedShaderData = await Promise.all(
        keys.map(async (key) => {
          const shaderJSON = await AsyncStorage.getItem(key);
          return shaderJSON != null ? JSON.parse(shaderJSON) : null;
        })
      );
      setShaderData(fetchedShaderData);
      //setSelectedShader(fetchedShaderData[0]?.code || '');
    };
    fetchShaders();
  }, []);
    
  // Effect to re-create the WebGL context when the shader changes
/*
  useEffect(() => {
    gl.current && onContextCreate(gl.current);
  }, [selectedShader]);
*/
   
    

   //////////Camera 
  function moveCameraZ(delta) {
    cameraPosition.current = [cameraPosition.current[0], cameraPosition.current[1], cameraPosition.current[2] + delta];
  }



  ////////////RENDER ENGINE



  function updateBuffers(_gl, vertices, indices) {
    let vertexBuffer = _gl.createBuffer();
    _gl.bindBuffer(_gl.ARRAY_BUFFER, vertexBuffer);
    _gl.bufferData(_gl.ARRAY_BUFFER, vertices, _gl.STATIC_DRAW);
    let indexBuffer = _gl.createBuffer();
    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, indices, _gl.STATIC_DRAW);
    let positionLocation = _gl.getAttribLocation(program.current, "position");
    _gl.enableVertexAttribArray(positionLocation);
    _gl.vertexAttribPointer(positionLocation, 4, _gl.FLOAT, false, 0, 0);
  }

  let gl = useRef(null);
  let angle = useRef(0);
  let previousTime = useRef(Date.now());
  var program = useRef(null);
  const cameraPosition = useRef([0, 0, 5]);
  let startTime = Date.now();
  const animationFrameId = useRef(null); // Declare a variable to keep a reference to the request ID
  const animationFrameRef = useRef(null);

  function onContextCreate(_gl) {
    gl.current = _gl;
    let vertexShader = _gl.createShader(_gl.VERTEX_SHADER);
    _gl.shaderSource(vertexShader, vertShaderSrc);
    _gl.compileShader(vertexShader);

    let fragmentShader = _gl.createShader(_gl.FRAGMENT_SHADER);
    _gl.shaderSource(fragmentShader, selectedShader);
    _gl.compileShader(fragmentShader);

    program.current = _gl.createProgram();
    _gl.attachShader(program.current, vertexShader);
    _gl.attachShader(program.current, fragmentShader);
    _gl.linkProgram(program.current);
    _gl.useProgram(program.current);

   
    let vertexBuffer = _gl.createBuffer();
    _gl.bindBuffer(_gl.ARRAY_BUFFER, vertexBuffer);
    _gl.bufferData(_gl.ARRAY_BUFFER, vertices, _gl.STATIC_DRAW);
    let indexBuffer = _gl.createBuffer();
    _gl.bindBuffer(_gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    _gl.bufferData(_gl.ELEMENT_ARRAY_BUFFER, indices, _gl.STATIC_DRAW);

    let positionLocation = _gl.getAttribLocation(program, "position");
    _gl.enableVertexAttribArray(positionLocation);
    _gl.vertexAttribPointer(positionLocation, 4, _gl.FLOAT, false, 0, 0);

    // After linking the program
    let uResolutionLocation = _gl.getUniformLocation(program.current, 'u_resolution');
    _gl.uniform2f(uResolutionLocation, _gl.drawingBufferWidth, _gl.drawingBufferHeight);

    _gl.enable(_gl.DEPTH_TEST);
    _gl.depthFunc(_gl.LEQUAL);


    programRef.current = program;

    let modelMatrix = mat4.create();
    let viewMatrix = mat4.lookAt(mat4.create(), cameraPosition, [0, 0, 0], [0, 1, 0]);
    let projectionMatrix = mat4.perspective(mat4.create(), Math.PI / 4, _gl.drawingBufferWidth / _gl.drawingBufferHeight, 0.1, 100);
    let modelViewProjectionMatrix = mat4.mul(mat4.create(), projectionMatrix, mat4.mul(mat4.create(), viewMatrix, modelMatrix));
    let modelViewProjectionMatrixLocation = _gl.getUniformLocation(program, "modelViewProjection");

    let animate = function() {
      let now = Date.now();
      let elapsedMilliseconds = now - previousTime.current;
      previousTime.current = now;
      let rotationPerSecond = Math.PI / 4;  // 1/4 rotation every second
      angle.current += (elapsedMilliseconds / 1000) * rotationPerSecond;
      mat4.identity(modelMatrix);
      mat4.rotateY(modelMatrix, modelMatrix, angle.current);
      mat4.rotateX(modelMatrix, modelMatrix, angle.current / 2);
      mat4.lookAt(viewMatrix, cameraPosition.current, [0, 0, 0], [0, 1, 0]);

      modelViewProjectionMatrix = mat4.mul(mat4.create(), projectionMatrix, mat4.mul(mat4.create(), viewMatrix, modelMatrix));
     _gl.uniformMatrix4fv(modelViewProjectionMatrixLocation, false, modelViewProjectionMatrix);
    
    
     let uTimeLocation = _gl.getUniformLocation(program.current, 'u_time');
     let time = (Date.now() - startTime) / 1000.0;
     _gl.uniform1f(uTimeLocation, time);


      _gl.clear(_gl.COLOR_BUFFER_BIT | _gl.DEPTH_BUFFER_BIT);
     // _gl.drawElements(_gl.TRIANGLES, 36, _gl.UNSIGNED_SHORT, 0);
      _gl.drawElements(_gl.TRIANGLES, indices.length, _gl.UNSIGNED_SHORT, 0);

      _gl.flush();
      _gl.endFrameEXP();
  
      animationFrameRef.current  = requestAnimationFrame(animate); // Store the request ID

    };


    animate();
  }

    useEffect(() => {
    if (selectedShader != null) {
      gl.current && onContextCreate(gl.current);
    }
  
    return () => {
      // Cancel the previous animation frame request when the shader changes
      if (animationFrameId != null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedShader]);


  // Clean up resources when the component is unmounted
  useEffect(() => {
    return () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
        console.log('removing animationFrameRef..');
      }
      if (animationFrameId.current != null) {
        cancelAnimationFrame(animationFrameId.current);
        console.log('removing animation..');
      }
      if (gl.current && programRef.current) {
        gl.current.deleteProgram(programRef.current);
        console.log('deleting GL..');
      }
      gl.current = null;
    };
  }, []);

  
  return (
    <View style={styles.container}>
    
    
    <GLView style={styles.glView} onContextCreate={onContextCreate} />



    <View style={styles.controls}>
        <Button title="Move Camera -Z" onPress={() => moveCameraZ(-1)} />
        <Button title="Move Camera +Z" onPress={() => moveCameraZ(1)} />
      </View>



      <ScrollView horizontal style={styles.shapeSelector}>
      {['cube', 'pyramid'].map((shape) => (
        <TouchableOpacity key={shape} style={styles.shaderButton} onPress={() => drawShape(shape)}>
          <Text style={styles.shaderButtonText}>{shape}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

      
     



  </View>
  );
}

/*
 <ScrollView horizontal style={styles.shaderSelector}>
        {shaderData.map((shader) => (
          <TouchableOpacity key={shader.name} style={styles.shaderButton} onPress={() => changeShader(shader.code)}>
            <Text style={styles.shaderButtonText}>{shader.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

*/

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glView: {
    width: '100%',
    height: '60%',
  },
  shapeSelector: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#eee', // Light gray background
    borderTopWidth: 1, // Add a top border
    borderTopColor: '#ccc', // Make the top border a darker gray
  },
  shapeButton: {
    padding: 10,
    backgroundColor: '#fff',
    margin: 5,
  },
  shapeButtonText: {
    fontSize: 16,
    color: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  shaderSelector: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#eee', // Light gray background
    borderTopWidth: 1, // Add a top border
    borderTopColor: '#ccc', // Make the top border a darker gray
  },
  shaderButton: {
    padding: 10,
    backgroundColor: '#fff', // White button background
    margin: 5,
    borderRadius: 3, // Round the button corners a bit
    borderWidth: 1, // Give the button a border
    borderColor: '#ccc', // Make the button border a darker gray
  },
  shaderButtonText: {
    fontSize: 16,
    color: '#000',
  },
});
