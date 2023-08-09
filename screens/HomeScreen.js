import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { mat4 } from 'gl-matrix';
import { GLView } from 'expo-gl';

function HomeScreen() {
  const navigation = useNavigation();

  const initialShaderCode = `
  precision highp float;

  // Width and height of the shader
  uniform vec2 u_resolution;
  
  // Time elapsed
  uniform float u_time;
  
  // Constants
  #define PI 3.1415925359
  #define TWO_PI 6.2831852
  
  void main()
  {
      float iGlobalTime = u_time;
      vec2 iResolution = u_resolution;
      float time = iGlobalTime * 2.0;
  
      // Adjust the scale of UVs for smoother patterns
      vec2 uv = (gl_FragCoord.xy / iResolution.xx - 0.5) * 4.0;
      vec2 uv0 = uv;
  
      float i0 = 1.0;
      float i1 = -1.0;
      float i2 = 0.5;
      float i4 = -1.0;
  
      for (int s = 0; s < 4; s++) // Reduced iterations to 4 for lesser complexity
      {
          vec2 r;
          r = vec2(cos(uv.y * i0 - i4 + time / (i1 * 4.0)), sin(uv.x * i0 - i4 + time / (i1 * 4.0))) / (i2 * 2.0);
          r += vec2(-r.y, r.x) * 0.1;  // Reduced distortion
          uv.xy += r;
  
          i0 *= 1.5;
          i1 *= 1.2;
          i2 *= 1.4;
          i4 += 0.03; // Reduced time's effect
      }
  
      float r = sin(uv.x - time * 0.5) * 0.5 + 0.5; // Slowed down the time's effect on colors
      float b = sin(uv.y + time * 0.5) * 0.5 + 0.5; // Same here
      float g = sin((uv.x + uv.y + sin(time * 0.25)) * 0.5) * 0.5 + 0.5; // And here
      gl_FragColor = vec4(r, g, b, 1.0);
  }
  
  

    `;

  // Get screen dimensions
  const screen = Dimensions.get('window');
  // Other shader and renderer variables
  const glRef = useRef(null);
  let program = null;
  var code = initialShaderCode;
  const animationFrameRef = useRef(null);// Declare a variable to keep a reference to the request ID
  const animationFrameId = useRef(null);
  const programRef = useRef(null);
  const gl = useRef(null);

  const onContextCreate = (gl) => {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 4, 4, -1]), gl.STATIC_DRAW);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(
      vertexShader,
      `attribute vec4 position;
       void main() {
         gl_Position = position;
       }`
    );
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, code);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const u_resolution = gl.getUniformLocation(program, 'u_resolution');
    const u_time = gl.getUniformLocation(program, 'u_time');
    programRef.current = program;
    const render = (time) => {
      gl.uniform2f(u_resolution, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.uniform1f(u_time, time * 0.001);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.endFrameEXP();
      // Request a new animation frame
      animationFrameRef.current = requestAnimationFrame(render);
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(render);
  };

  // Clean up resources when the component is unmounted
  useEffect(() => {
    return () => {
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
      <GLView
        style={styles.background}
        onContextCreate={(glContext) => {
          gl.current = glContext;
          onContextCreate(glContext);
        }}
      />
      <Text style={styles.text}>Welcome to ShaderVF</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.buttonText}>Go to Shaders List</Text>
      </TouchableOpacity>
    </View>
    );

  
}

export default function() {
  return (
      <HomeScreen />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  text: {
    fontSize: 30,
    
    color: 'black',
    // Add any additional text styles you need here
  },
  button: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  buttonText: {
    color: 'black',
    fontSize: 20,
  },
});
