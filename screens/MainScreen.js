import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity, ScrollView, Image, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import Constants from 'expo-constants';



const MainScreen = () => {
    const navigation = useNavigation();
   

    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownPreVisible, setDropdownPreVisible] = useState(false);

    const DropdownItem = ({ title, code }) => (
        <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('TextEditor', { shader: {code:codeList[code].code}})} >
          <View style={{flexDirection: "row", left:20}}>
          <Icon name="list" type="font-awesome" size={30} color='#3366CC'style={{top:7}}  />
            <Text style={styles.text}>{title}</Text>
          </View>
          
        </TouchableOpacity>
      );

      const DropdownPreSavedItem = ({ title, genre }) => (
        <TouchableOpacity style={styles.dropdownItem} onPress={() => navigation.navigate('ShaderList', {global: true, genre: genre})} >
          <View style={{flexDirection: "row", left:20}}>
          <Icon name="list" type="font-awesome" size={30} color='#3366CC' style={{top:7}} />
            <Text style={styles.text}>{title}</Text>
          </View>
          
        </TouchableOpacity>
      );
// navigation.navigate('TextEditor', { shader: '' })

    return (
      <View style={styles.container}>
        <View style={{padding:40}}></View>

          <View style={{ alignItems: 'center'}}>
            <Image source={require('../assets/icon-transparent.png')} style={{width:140, height:140, borderRadius:20}}/>
            <Text style={{color:'white', padding:10, fontSize:20}}>ShaderVF - {Constants.expoConfig.version}</Text>
          </View>

        <ScrollView>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShaderList', {global: true, genre: "submissions"})}>
              <View style={{flexDirection: "row"}}>
                  <Icon name="globe" type="font-awesome" size={30} color='lightblue' style={{top:7}}/>
                  <Text style={styles.text}>Online submissions</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => setDropdownVisible(!dropdownVisible)}>
              <View style={{flexDirection: "row"}}>
                  <Icon name="laptop-code" type="font-awesome-5" size={30} color='orange' style={{top:7}}/>
                  <Text style={styles.text}>Advanced Shader Editor</Text>
              </View>
            </TouchableOpacity>
            {dropdownVisible && (
            <View style={styles.dropdownContainer}>
            <DropdownItem title="New empty template" code="0" />
            <DropdownItem title="New basic template" code="1" />
            <DropdownItem title="New animated template" code="2" />
            </View>
            )}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShaderList', {global: false, genre: "saved"})}>
            <View style={{flexDirection: "row"}}>
                <Icon name="user" type="font-awesome" size={30} color='green' style={{top:7}} />
                <Text style={styles.text}>My Saved Shaders</Text>
            </View>
            </TouchableOpacity>

            

            <TouchableOpacity style={styles.button} onPress={() => setDropdownPreVisible(!dropdownPreVisible)}>
            <View style={{flexDirection: "row"}}>
                <Icon name="file" type="font-awesome" size={30} color='white' style={{top:7}} />
                <Text style={styles.text}>Pre-Saved Shaders</Text>
            </View>
            </TouchableOpacity>
            {dropdownPreVisible && (
            <View style={styles.dropdownContainer}>
              <DropdownPreSavedItem title="All shaders" genre="all" />
              <DropdownPreSavedItem title="Fractals" genre="fractals" />
            </View>
            )}

            
            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Tutorials Coming Soon!')}>
            <View style={{flexDirection: "row"}}>
                <Icon name="question" type="font-awesome" size={30} color='yellow' style={{top:7}} />
                <Text style={styles.text}>Tutorials</Text>
            </View>
            </TouchableOpacity>
            

            <TouchableOpacity style={styles.button} onPress={() => Alert.alert('Settings Coming Soon!')}>
            <View style={{flexDirection: "row"}}>
                <Icon name="gear" type="font-awesome" size={30} color='grey' style={{top:7}} />
                <Text style={styles.text}>Settings</Text>
            </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => {
              Linking.openURL('https://www.WordUndefined.com')
              .catch(err => console.error('An error occurred', err));

            }}>
            <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                <Icon name="info" type="font-awesome" size={30} color='grey' style={{top:7}} />
                <Text style={styles.text}> WordUndefined.com</Text>
                
                <Text style={{fontSize: 12,
    color: 'white', 
    marginTop: 10,
    marginLeft: 5, 
    marginRight: 5,}}>We believe that language is a living entity – here you can contribute to its evolution by sharing your own unique interpretations of words. Words defined by experience, culture, context, personal belief, and more.</Text>
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
        borderRadius: 25,
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
        borderRadius: 25,
      }
  });


  const codeList = [

    {code:
        
    `precision highp float;

uniform vec2 u_resolution;
uniform float u_time; 
    
void main() {
    
}
    `},

    {code:
`precision highp float;

uniform vec2 u_resolution;
uniform float u_time; 
    
void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}
    `},
    {code:
      `precision highp float;

uniform vec2 u_resolution;
uniform float u_time; 

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    
    // Oscillating values between 0.0 and 1.0 based on u_time
    float red = 0.5 + 0.5 * sin(u_time);
    float green = 0.5 + 0.5 * sin(u_time + 3.14159);  // Pi phase offset to make it out of sync with red

    gl_FragColor = vec4(red, green, uv.y, 1.0);
}
          `},
    

  ];


  export default MainScreen;