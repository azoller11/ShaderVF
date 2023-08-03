import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList, Button,Animated,RefreshControl   } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SwipeListView } from 'react-native-swipe-list-view';
//import { GLView } from 'expo-gl';
//import { mat4 } from 'gl-matrix';

const ShaderListScreen = () => {
    const shaderOptions = ['Option 1', 'Option 2', 'Option 3']; // Replace with your actual options
    const navigation = useNavigation();
    const [shaders, setShaders] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const rowSwipeAnimatedValues = {}; 
    const [selectedShader, setSelectedShader] = useState({code: ``});



    shaders.forEach((shader) => {
        rowSwipeAnimatedValues[shader.name] = new Animated.Value(0);
      });


    const loadShaders = async () => {
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
      };

      const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        loadShaders().then(() => setRefreshing(false));
      }, []);
      
      useEffect(() => {
        loadShaders();
      }, []);

      const deleteShader = async (name) => {
        try {
          await AsyncStorage.removeItem(`@Shader:${name}`);
          // After deleting the shader, load the shaders again to update the list
          loadShaders();
        } catch (error) {
          console.log(error);
        }
      };
      const renderItem = ({ item }) => (
        <View style={styles.item}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Button title="View Shader" onPress={() => setSelectedShader(item)} />
          <Button title="Edit Shader" onPress={() => navigation.navigate('TextEditor', { shader: item })} />
        </View>
      );
    
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
              <Text
              style={{height:200,width:'100%'}}
              > Render Shader here</Text>
            </View>
          );
        }
      }

      return (
        <View style={styles.container}>
            <View>
                <View style={[styles.text, {padding:20, color:'black', top:10}]}></View>
                


        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Create3D', { shader: '' })}>
          <Text style={styles.text}>3D Objects</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('TextEditor', { shader: '' })}>
          <Text style={styles.text}>Advanced Shader Editor</Text>
        </TouchableOpacity>


 
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