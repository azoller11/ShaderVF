import React, { useEffect, useState,useRef,   } from 'react';
import { Keyboard, StyleSheet, View, Button, Platform, ScrollView, TouchableOpacity, Text, Alert, Modal, TextInput, Dimensions  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeyboard } from '@react-native-community/hooks';
import CodeEditor, { CodeEditorSyntaxStyles } from '@rivascva/react-native-code-editor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GLView } from 'expo-gl';
import { mat4 } from 'gl-matrix';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';


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
  const programRef = useRef(null);
  const gl = useRef(null);
  const animationFrameRef = useRef(null);// Declare a variable to keep a reference to the request ID
  const animationFrameId = useRef(null);

  const [glViewKey, setGlViewKey] = useState(0);


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
  const [shaderAuthor, setShaderAuthor] = useState(route.params.shader ? route.params.shader.author : '');
  const [shaderGenre, setShaderGenre] = useState(route.params.shader ? route.params.shader.genre : '');


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
        author: shaderAuthor,
        code: code,
        description: shaderDescription,
        name: shaderName,
        genre: shaderGenre,
        datesubmitted: ''
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
    //Keyboard.dismiss();
    
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

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.log('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
      //alert(gl.getShaderInfoLog(fragmentShader));
      return;
    }

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

  
 

  useEffect(() => {
    if (code != null) {
      console.log(code);
      setCode(code);
      gl.current && onContextCreate(gl.current);
    }
    return () => {
        // Cancel the previous animation frame request when the shader changes
        if (animationFrameId.current != null) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
  }, [code]);

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

  function showPreview() {
    if (preview) {
        return (
            <View >
               
                <GLView
                key={glViewKey}
                style={{height:full, width:'100%'}}
                onContextCreate={(glContext) => {
                  gl.current = glContext;
                  onContextCreate(glContext);
                }}
            />
            </View>
        );
    }
  }


  

  function prev() {
    Keyboard.dismiss();
    console.log(preview);
    setPreview(!preview);
  }

  function fullScreen() {
    Keyboard.dismiss();
    setFull(full === 150 ? windowWidth : 150); 
    setGlViewKey(glViewKey + 1); // Increment the key to force re-render

  }

  function environmentView() {
    navigation.navigate('Enviornment', { shader: {code:code} })
  }



  
  return (
    <View style={{flex: 1, backgroundColor:'black'}}>

<View style={[styles.buttonContainer]}>
        <ScrollView horizontal keyboardShouldPersistTaps='always'>
        <TouchableOpacity style={styles.button} onPress={() =>  navigation.goBack()}>
            <Icon name="arrow-left" type="material-community" size={30} color='white' style={{top:0}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={ Keyboard.dismiss}>
            <Icon name="keyboard-close" type="material-community" size={30} color='white' style={{top:0}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
            <Icon name="content-save" type="material-community" size={30} color='white' style={{top:0}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setFontSize(fontSize + 2)}>
          < Icon name="format-font-size-increase" type="material-community" size={30} color='white' style={{top:0}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setFontSize(fontSize - 2)}>
            <Icon name="format-font-size-decrease" type="material-community" size={30} color='white' style={{top:0}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => environmentView()}>
            <Icon name="cube-outline" type="material-community" size={30} color='white' style={{top:0}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => fullScreen()}>
            <Icon name="fullscreen" type="material-community" size={30} color='white' style={{top:0}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => prev()}>
            <Icon name="fit-to-screen" type="material-community" size={30} color='white' style={{top:0}} />
          </TouchableOpacity>

          
          
        </ScrollView>
      </View>

    
        {showPreview()}
      
      <View style={{ paddingBottom: keyboardHeight}}>
        <CodeEditor
            initialValue={code}
            code={code}
            onChange={(newText => setCode(newText))}
            //onCodeChange={newText => setCode(newText)}
            style={{
            ...{
                fontSize: fontSize,
                inputLineHeight: 26,
                highlighterLineHeight: 26,
                
            },
            ...(keyboard.keyboardShown
                ? { marginBottom: keyboard.keyboardHeight - (insets.bottom*2) }
                : {}),
            }}
            language="glsl" // change to your preferred language if 'glsl' doesn't work
            syntaxStyle={CodeEditorSyntaxStyles.atomOneDark}
            showLineNumbers
        />
      </View>
    
   
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => Alert.alert('Modal has been closed.')}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalButtonContainer}>
            <Button title="Submit" onPress={saveShader} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>

          <TextInput
            placeholder="Shader Name"
            onChangeText={setShaderName}
            style={styles.input}
            value={shaderName}
          />

        

          <TextInput
            placeholder="Shader Author"
            onChangeText={setShaderAuthor}
            style={styles.input}
            value={shaderAuthor}
          />

         

          <TextInput
            multiline
            placeholder="Shader Code"
            onChangeText={setCode}
            style={styles.shaderCodeInput}
            value={code}
          />
        </View>


      </Modal>
    </View>
  );
};

/*
<View style={styles.modalContainer}>
          <View style={styles.modalButtonContainer}>
            <Button title="Submit" onPress={saveShader} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>

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
            placeholder="Shader Author"
            onChangeText={setShaderAuthor}
            style={styles.input}
            value={shaderAuthor}
          />

          <TextInput
            placeholder="Shader Genre"
            onChangeText={setShaderGenre}
            style={styles.input}
            value={shaderGenre}
          />

          <TextInput
            multiline
            placeholder="Shader Code"
            onChangeText={setCode}
            style={styles.shaderCodeInput}
            value={code}
          />
        </View>


*/ 


const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding:20,
        bottom:-20,

      },
      button: {
        margin: 1,
        padding: 6,
        //backgroundColor: 'lightgrey',
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
      },
      modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#2A2A2A',
        padding: 20,
      },
      input: {
        padding: 30,
        fontSize: 15,
        backgroundColor: 'grey',
        borderRadius: 5,
        marginVertical: 5,
      },
      modalContainer: {
        padding: 20,
        paddingTop: 40,
        backgroundColor:'#2A2A2A'
      },
      shaderCodeInput: {
        padding: 20,
        fontSize: 15,
        backgroundColor: 'grey',
        borderRadius: 5,
        marginVertical: 5,
        minHeight: 100,
      },
  });
export default TextEditorScreen;
