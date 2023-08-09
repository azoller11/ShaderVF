import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';


const MainScreen = () => {
    const navigation = useNavigation();
   

    const [dropdownVisible, setDropdownVisible] = useState(false);

    const DropdownItem = ({ title, code }) => (
        <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('TextEditor', { shader: {code:codeList[code].code}})} >
          <View style={{flexDirection: "row"}}>
          <Icon name="code" type="font-awesome" size={20} color='#3366CC' />
            <Text style={styles.text}>{title}</Text>
          </View>
          
        </TouchableOpacity>
      );
// navigation.navigate('TextEditor', { shader: '' })

    return (
      <View style={styles.container}>
        <View style={{padding:40}}></View>

          <View style={{ alignItems: 'center'}}>
            <Image source={require('../assets/icon-transparent.png')} style={{width:120, height:120}}/>
            <Text style={{color:'white', padding:10, fontSize:20}}>ShaderVF</Text>
          </View>

        <ScrollView>

        
            <TouchableOpacity style={styles.button} onPress={() => setDropdownVisible(!dropdownVisible)}>
            <View style={{flexDirection: "row"}}>
                <Icon name="code" type="font-awesome" size={30} color='#3366CC' />
                <Text style={styles.text}>Advanced Shader Editor</Text>
            </View>
            
            </TouchableOpacity>
            {dropdownVisible && (
            <View style={styles.dropdownContainer}>
            <DropdownItem title="New empty template" code="0" />
            <DropdownItem title="New basic template" code="1" />
            </View>
            )}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShaderList', {global: false})}>
            <View style={{flexDirection: "row"}}>
                <Icon name="save" type="font-awesome" size={30} color='#3366CC' />
                <Text style={styles.text}>Saved Shaders</Text>
            </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShaderList', {global: true})}>
            <View style={{flexDirection: "row"}}>
                <Icon name="globe" type="font-awesome" size={30} color='#3366CC' />
                <Text style={styles.text}>Pre-Saved Shaders</Text>
            </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Tutorials Coming Soon!')}>
            <View style={{flexDirection: "row"}}>
                <Icon name="question" type="font-awesome" size={30} color='#3366CC' />
                <Text style={styles.text}>Tutorials</Text>
            </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Settings Coming Soon!')}>
            <View style={{flexDirection: "row"}}>
                <Icon name="gear" type="font-awesome" size={30} color='#3366CC' />
                <Text style={styles.text}>Settings</Text>
            </View>
            </TouchableOpacity>

        </ScrollView>


      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor:'#121212'
    },
    text: {
      fontSize: 20,
      textAlign: 'left',
      margin: 10,
      color: '#fff',
    },
    button: {
        backgroundColor: '#2A2A2A',
        padding: 10,
        marginVertical: 2,
      },
      dropdownContainer: {
        borderWidth: 1,
        borderColor: '#2A2A2A',
        borderRadius: 4,
      },
      dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
      }
  });


  const codeList = [

    {code:
        
    `precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_time;
    
void main() {
    
}
    `},

    {code:
`precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_time;
    
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}
    `},
    

  ];


  export default MainScreen;