import React, { useEffect, useState,useRef } from 'react';
import { Keyboard, StyleSheet, View, Button, Platform, ScrollView, TouchableOpacity, Text, Alert, Modal, TextInput, Dimensions  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboard } from '@react-native-community/hooks';
import CodeEditor, { CodeEditorSyntaxStyles } from '@rivascva/react-native-code-editor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GLView } from 'expo-gl';
import { useNavigation } from '@react-navigation/native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const initialShaderCode = `precision mediump float;

precision mediump float;

uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}

`;

const TextEditorScreen = ({ route }) => {
  const keyboard = useKeyboard();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const glRef = useRef(null);
  let program = null;

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [fontSize, setFontSize] = useState(12);
  const [preview, setPreview] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [full, setFull] = useState(150);
  const windowWidth = Dimensions.get('window').width;

  const [code, setCode] = useState(route.params.shader ? route.params.shader.code : initialShaderCode);
  const [shader, setShader] = useState(route.params.shader ? route.params.shader.code : initialShaderCode);
  const [shaderName, setShaderName] = useState(route.params.shader ? route.params.shader.name : '');
  const [shaderDescription, setShaderDescription] = useState(route.params.shader ? route.params.shader.description : '');


  useEffect(() => {
    if (route.params.shader) {
      setShader(route.params.shader.code);
      setShaderName(route.params.shader.name);
      setShaderDescription(route.params.shader.description);
    }
  }, [route.params.shader]);


  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);



  const saveShader = async () => {
    try {
      let shaderData = {
        name: shaderName,
        description: shaderDescription,
        code: code,
      }
  
      // Convert shaderData to a string using JSON.stringify
      const value = JSON.stringify(shaderData);
  
      await AsyncStorage.setItem(`@Shader:${shaderName}`, value);
      Alert.alert('Shader saved successfully!');
      setModalVisible(false);
    } catch (error) {
      // Error saving data
      Alert.alert('Error saving shader!');
    }
  };

  const onContextCreate = (gl) => {
    glRef.current = gl;
    handleRenderShader();
  };

  const handleRenderShader = () => {
    Keyboard.dismiss();
    setShader(code);
    const gl = glRef.current;
    if (gl) {
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, 'attribute vec4 position; void main() { gl_Position = position; }');
      gl.compileShader(vertexShader);
      
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, shader);
      gl.compileShader(fragmentShader);
      
      program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      
      gl.useProgram(program);
      
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 4, 4, -1]), gl.STATIC_DRAW);
      
      const positionLocation = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
      // Get uniform locations for u_time and u_resolution
      const u_timeLocation = gl.getUniformLocation(program, 'u_time');
      const u_resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  
      // Pass u_resolution to the shader
      gl.uniform2f(u_resolutionLocation, gl.drawingBufferWidth, gl.drawingBufferHeight);
  


      requestAnimationFrame(time => draw(time, u_timeLocation));
    }
  };
  
  const draw = (time, u_timeLocation) => {
    const gl = glRef.current;
  
    // Pass u_time to the shader
    gl.uniform1f(u_timeLocation, time / 1000.0);
  
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.flush();
    gl.endFrameEXP();
    requestAnimationFrame(time => draw(time, u_timeLocation));
  };




  function save() {

  }

  function compile() {
    //Keyboard.dismiss();
    handleRenderShader();
  }

  function prev() {
    console.log(preview);
    setPreview(!preview);
  }

  function fullScreen() {
    if (full == 150)
        setFull(windowWidth);
    else
        setFull(150);
  }


  function showPreview() {
    if (preview) {
        return (
            <View >
               
                <GLView
                style={{height:full, width:'100%'}}
                onContextCreate={onContextCreate}
            />
            </View>
        );
    }
  }

  return (
    <View style={{flex: 1}}>

<View style={styles.buttonContainer}>
        <ScrollView horizontal keyboardShouldPersistTaps='always'>
          <TouchableOpacity style={styles.button} onPress={() =>  navigation.goBack()}>
            <Text>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Text>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setFontSize(fontSize + 2)}>
            <Text>A+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setFontSize(fontSize - 2)}>
            <Text>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => compile()}>
            <Text>Compile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => prev()}>
            <Text>Toggle Preview</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => fullScreen()}>
            <Text>Preview Fullscreen</Text>
          </TouchableOpacity>
          
        </ScrollView>
      </View>

    
        {showPreview()}
      
      <View style={{ paddingBottom: keyboardHeight}}>
        <CodeEditor
            initialValue={code}
            code={code}
            onChange={(newText => setCode(newText))}
            onCodeChange={newText => setCode(newText)}
            style={{
            ...{
                fontSize: fontSize,
                inputLineHeight: 26,
                highlighterLineHeight: 26,
                
            },
            ...(keyboard.keyboardShown
                ? { marginBottom: keyboard.keyboardHeight - (insets.bottom*3) }
                : {}),
            }}
            language="glsl" // change to your preferred language if 'glsl' doesn't work
            syntaxStyle={CodeEditorSyntaxStyles.atomOneDark}
            showLineNumbers
        />
      </View>
    
   

    <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
            Alert.alert('Modal has been closed.');
        }}
        >
            <View style={[styles.container, {padding:20, top:20}]}>
                <Button title="Submit" onPress={saveShader}/>
                <Button title="Cancel" onPress={() => setModalVisible(false)} />
            
                <TextInput
                placeholder="Shader Name"
                onChangeText={setShaderName}
                style={styles.input}
                value={shaderName}
                />
                <TextInput
                placeholder="Shader Description"
                onChangeText={setShaderDescription}
                style={styles.input}
                value={shaderDescription}
                />
                <TextInput
                multiline
                placeholder="Shader Code"
                onChangeText={setShader}
                style={styles.input}
                value={shader}
                />
                
            </View>
        </Modal>  
    </View>
  );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#eee',
        padding:20,
        bottom:-20
      },
      button: {
        margin: 10,
        padding: 10,
        backgroundColor: 'lightgrey',
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
      },
      input: {
        padding:20,
        fontSize:15,
        backgroundColor:'grey'
        
      },
  });
export default TextEditorScreen;
