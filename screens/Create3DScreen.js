import React, { useState, useRef,useEffect } from 'react';
import { StyleSheet, View, TextInput, Button,  ScrollView, TouchableOpacity, Text } from 'react-native';
import { GLView } from 'expo-gl';
import { mat4 } from 'gl-matrix';
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


export default function Create3DScreen() {

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
      case 'triangle':
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
      case 'circle':
        // draw circle
        const sphereData = createSphere(2, 20, 20);
        v = (sphereData.vertices);
        i = (sphereData.indices);
        break;
      case 'rhombus':
        // draw rhombus
        v = (new Float32Array([
          -0.5, -0.5, 0.0, // bottom left point
          0.0, 0.5, 0.0, // top point
          0.5, -0.5, 0.0, // bottom right point
          0.0, -1.5, 0.0, // bottom point
        ]));
        i = (new Uint16Array([0, 1, 2, 2, 3, 0]));
        break;
      case 'torus':
        // draw torus
        var torusData = createTorus(1, 0.4, 16, 8);
        v = (new Float32Array(torusData.vertices.flat()));
        i = (new Uint16Array(torusData.indices.flat()));
        break;
      default:
        break;
    }
    setVertices(v);
    setIndices(i);
    updateBuffers(gl.current, v, i);
  }


  function createTorus(ringRadius, tubeRadius, ringSegments, tubeSegments) {
    var vertices = [];
    var indices = [];

    for (var i = 0; i <= ringSegments; ++i) {
        for (var j = 0; j <= tubeSegments; ++j) {
            var u = i / ringSegments * 2 * Math.PI;
            var v = j / tubeSegments * 2 * Math.PI;

            var center = [ringRadius * Math.cos(u), ringRadius * Math.sin(u), 0];
            var direction = [Math.cos(u), Math.sin(u), 0];
            var point = [tubeRadius * Math.cos(v), tubeRadius * Math.sin(v), 0];

            vertices.push([
                center[0] + direction[0] * point[0] - direction[1] * point[1],
                center[1] + direction[1] * point[0] + direction[0] * point[1],
                point[2]
            ]);

            if (i < ringSegments && j < tubeSegments) {
                var a = i * (tubeSegments + 1) + j;
                var b = a + tubeSegments + 1;

                indices.push([a, b, a + 1]);
                indices.push([b, b + 1, a + 1]);
            }
        }
    }

    return {vertices, indices};
}

  function createSphere(radius, latBands, longBands) {
    var vertices = [];
    var indices = [];

    for (let latNumber = 0; latNumber <= latBands; latNumber++) {
        let theta = latNumber * Math.PI / latBands;
        let sinTheta = Math.sin(theta);
        let cosTheta = Math.cos(theta);

        for (let longNumber = 0; longNumber <= longBands; longNumber++) {
            let phi = longNumber * 2 * Math.PI / longBands;
            let sinPhi = Math.sin(phi);
            let cosPhi = Math.cos(phi);

            let x = cosPhi * sinTheta;
            let y = cosTheta;
            let z = sinPhi * sinTheta;

            vertices.push(radius * x, radius * y, radius * z);
        }
    }

    for (let latNumber = 0; latNumber < latBands; latNumber++) {
        for (let longNumber = 0; longNumber < longBands; longNumber++) {
            let first = (latNumber * (longBands + 1)) + longNumber;
            let second = first + longBands + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint16Array(indices),
    };
}

  //////////Shader selector 
  const [shaderData, setShaderData] = useState([]);
  const [selectedShader, setSelectedShader] = useState('');
  const changeShader = (newShaderCode) => setSelectedShader(newShaderCode);
  let changingShader = useRef(false);
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
      setSelectedShader(fetchedShaderData[0]?.code || '');
    };
    fetchShaders();
  }, []);
    
  // Effect to re-create the WebGL context when the shader changes
  useEffect(() => {
    gl.current && onContextCreate(gl.current);
  }, [selectedShader]);

    

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
  
      requestAnimationFrame(animate);
    };


    animate();
  }

  
  return (
    <View style={styles.container}>
    
    
    <GLView style={styles.glView} onContextCreate={onContextCreate} />



    <View style={styles.controls}>
        <Button title="Move Camera -Z" onPress={() => moveCameraZ(-1)} />
        <Button title="Move Camera +Z" onPress={() => moveCameraZ(1)} />
      </View>



      <ScrollView horizontal style={styles.shapeSelector}>
      {['cube', 'triangle', 'circle', 'rhombus', 'torus'].map((shape) => (
        <TouchableOpacity key={shape} style={styles.shaderButton} onPress={() => drawShape(shape)}>
          <Text style={styles.shaderButtonText}>{shape}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>

      <ScrollView horizontal style={styles.shaderSelector}>
        {shaderData.map((shader) => (
          <TouchableOpacity key={shader.name} style={styles.shaderButton} onPress={() => changeShader(shader.code)}>
            <Text style={styles.shaderButtonText}>{shader.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>



  </View>
  );
}

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