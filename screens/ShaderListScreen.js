import React, { useState, useEffect, useRef } from 'react';
import { Keyboard, View, TouchableOpacity, Text, StyleSheet, FlatList, Button,Animated,RefreshControl, Alert   } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeListView } from 'react-native-swipe-list-view';
import { mat4 } from 'gl-matrix';
import { GLView } from 'expo-gl';
import { Icon } from 'react-native-elements';

const ShaderListScreen = ({route}) => {
    const shaderOptions = ['Option 1', 'Option 2', 'Option 3']; // Replace with your actual options
    const navigation = useNavigation();
    const [shaders, setShaders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const rowSwipeAnimatedValues = {}; 
    const [global, setGlobal] = useState(route.params.global ? route.params.global : false);
    const [selectedShader, setSelectedShader] = useState({code: `precision mediump float;

    
    precision mediump float;
    
    uniform vec2 u_resolution;
    
    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
    }`});

  /////////////Shader renderer
 
  
  const glRef = useRef(null);
  let program = null;
  var code = selectedShader;
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
    gl.shaderSource(fragmentShader, selectedShader.code);
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

  





/////////////////List maker
    useEffect(() => {
      if (selectedShader != null) {
        gl.current && onContextCreate(gl.current);
      }

      return () => {
        // Cancel the previous animation frame request when the shader changes
        if (animationFrameId.current != null) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [selectedShader]);



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


    const loadShaders = async () => {

      if (!global) {
        try {
          // Get all the keys
          const keys = await AsyncStorage.getAllKeys();
          const shaderKeys = keys.filter((key) => key.startsWith("@Shader:"));
    
          // Get all the shaders
          const shaderPromises = shaderKeys.map((key) => AsyncStorage.getItem(key));
          const shaderStrings = await Promise.all(shaderPromises);
    
          // Parse the shaders and set the state
          const parsedShaders = shaderStrings.map((str) => JSON.parse(str));
          setShaders(parsedShaders);
        } catch (error) {
          // Error retrieving data
          console.log(error);
        }
      } else {
        try {
          let shaderData = {
            name: "Test Global",
            description: "Global",
            code: code,
            author: 'Alex',
          }
          let shaderData2 = {
            name: "Test Global2",
            description: "Global2",
            code: code,
            author: 'Alex2',
          }
          setShaders([shaderData, shaderData2]);
        } catch(error) {

        }
      }
      
      };

      const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadShaders().then(() => setRefreshing(false));
      }, []);
      
      useEffect(() => {
        loadShaders();
      }, []);

      const deleteShader = async (name) => {
        
        Alert.alert(
          'Delete Shader', // Alert title
          'Are you sure you want to delete this shader?', // Alert message
          [
            {
              text: 'No',
              onPress: () => console.log('Shader not deleted'),
              style: 'cancel', // iOS style
            },
            {
              text: 'Yes',
              onPress: () => {
                try {
                  AsyncStorage.removeItem(`@Shader:${name}`);
                  // After deleting the shader, load the shaders again to update the list
                  loadShaders();
                } catch (error) {
                  console.log(error);
                }
                console.log('Shader deleted');},
            },
          ],
          { cancelable: true }, // Clicking outside will close the alert (on Android)
        );

        

      };
      const renderItem = ({ item }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>


          <View style={{flexDirection: "row" ,marginLeft: 0, padding:10, justifyContent: 'space-evenly'}}>
            
            
            <TouchableOpacity style={{}} onPress={() => {setSelectedShader(item);}}>
              <Icon name="eye" type="font-awesome" size={30} color='#3366CC' />
            </TouchableOpacity>
            
            <TouchableOpacity style={{}} onPress={() => navigation.navigate('TextEditor', { shader: item })}>
              <Icon name="code" type="font-awesome" size={30} color='#3366CC' />
            </TouchableOpacity>

            <TouchableOpacity style={{}} onPress={() => navigation.navigate('Create3D', { shader: item })}>
              <Icon name="cube" type="font-awesome" size={30} color='#3366CC' />
            </TouchableOpacity>

            <TouchableOpacity style={{}} onPress={() => console.log('push to global')}>
              <Icon name="globe" type="font-awesome" size={30} color='#3366CC' />
            </TouchableOpacity>

            <TouchableOpacity style={{}} onPress={() => saveItem(item)}>
              <Icon name="save" type="font-awesome" size={30} color='#3366CC' />
            </TouchableOpacity>
          </View>
         

        </View>
      );

      async function saveItem(item) {
        const value = JSON.stringify(item);
        await AsyncStorage.setItem(`@Shader:${item.name}`, value);
        Alert.alert('Shader saved successfully!');
      }
    
      const renderHiddenItem = (data, rowMap) => (
        <View style={styles.rowBack}>
          <TouchableOpacity
            style={[styles.backRightBtn, styles.backRightBtnRight]}
            onPress={() => deleteShader(data.item.name)}
          >
            <Text style={styles.backTextWhite}>Delete</Text>
          </TouchableOpacity>
        </View>
      );

      const onRowDidOpen = (rowKey, rowMap) => {
        // Delete the shader
        deleteShader(rowKey);
    
        // Close the row
        if (rowMap[rowKey]) {
          rowMap[rowKey].closeRow();
        }
      };

      


      function renderShader() {
        if (selectedShader != null ) {
          //console.log(selectedShader.code);
          return (
            <View >
              <GLView
                style={{height:200, width:'100%',padding:2}}
                onContextCreate={(glContext) => {
                  gl.current = glContext;
                  onContextCreate(glContext);
                }}
            />
            </View>
          );
        }
      }

      return (
        <View style={styles.container}>
            <View>
                <View style={[styles.text, {padding:20, color:'black', top:10}]}></View>
                




 
                </View>


          <View>
            {renderShader() }
          </View>


                <SwipeListView
      data={shaders}
      renderItem={renderItem}
      renderHiddenItem={renderHiddenItem}
      rightOpenValue={-75}
      keyExtractor={item => item.name}
      onRowDidOpen={onRowDidOpen}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    />
        </View>
      );
    };

    const styles = StyleSheet.create({
        container: {
          flex: 1,
          justifyContent: 'center',
          padding: 10,
          backgroundColor:'#121212'
          
        },
        button: {
          backgroundColor: '#2A2A2A',
          padding: 10,
          marginVertical: 2,
        },
       
        text: {
            fontSize: 24,
            color: '#fff',
        },
        item: {
            padding: 10,
            marginVertical: 2,
            marginHorizontal: 2,
            backgroundColor:'#2A2A2A'
            },
        title: {
          fontSize: 32,
          color:'white',
        },
        description: {
          fontSize: 16,
          color:'#B0B0B0',
          padding:20,
        },

        rowBack: {
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            paddingRight: 15,
          },
          backRightBtn: {
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 0,
            bottom: 0,
            width: 75,
          },
          backRightBtnRight: {
            right: 0,
          },
          backTextWhite: {
            color: 'red',
          },
      });
  
  export default ShaderListScreen;