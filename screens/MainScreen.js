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
            <DropdownItem title="Basic 3D Cube template" code="3" />
            <DropdownItem title="Animated 3D Cube template" code="4" />
            </View>
            )}
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ShaderList', {global: false, genre: "saved"})}>
            <View style={{flexDirection: "row"}}>
                <Icon name="user" type="font-awesome" size={30} color='cyan' style={{top:7}} />
                <Text style={styles.text}>My Saved Shaders</Text>
            </View>
            </TouchableOpacity>

            

            <TouchableOpacity style={styles.button} onPress={() => setDropdownPreVisible(!dropdownPreVisible)}>
            <View style={{flexDirection: "row"}}>
                <Icon name="database" type="font-awesome" size={30} color='white' style={{top:7}} />
                <Text style={styles.text}>Pre-Saved Shaders</Text>
            </View>
            </TouchableOpacity>
            {dropdownPreVisible && (
            <View style={styles.dropdownContainer}>
              <DropdownPreSavedItem title="All shaders" genre="all" />
              <DropdownPreSavedItem title="Fractals" genre="fractals" />
            </View>
            )}

     

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Enviornment',)}>


            <View style={{flexDirection: "row"}}>
                <Icon name="cube-outline" type="material-community" size={40} color='yellow' style={{top:7}} />
                <Text style={styles.text}>3D Enviornment</Text>
            </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Tutorial')}>
            <View style={{flexDirection: "row"}}>
                <Icon name="school" type="material-community" size={30} color='yellow' style={{top:7}} />
                <Text style={styles.text}>Tutorials</Text>
            </View>
            </TouchableOpacity>
            

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Settings')}>
            <View style={{flexDirection: "row"}}>
                <Icon name="gear" type="font-awesome" size={30} color='grey' style={{top:7}} />
                <Text style={styles.text}>Settings</Text>
            </View>
            </TouchableOpacity>

            
          

            

            <View > 
              <Text style={{textAlign:'center', fontSize:18, color:'white', padding:10}}> Other projects by the developer</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => {
              Linking.openURL('https://www.WordUndefined.com')
              .catch(err => console.error('An error occurred', err));

            }}>

            <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                <Icon name="info" type="font-awesome" size={30} color='grey' style={{top:7}} />
                <Text style={styles.text}> WordUndefined.com</Text>
                <Icon name="link" type="font-awesome" size={30} color='grey' style={{top:7}} />
                <Text style={{fontSize: 12,
    color: 'white', 
    marginTop: 10,
    marginLeft: 5, 
    marginRight: 5,}}>We believe that language is a living entity – here you can contribute to its evolution by sharing your own unique interpretations of words. Words defined by experience, culture, context, personal belief, and more.</Text>
            </View>
            </TouchableOpacity>

            <View > 
              <Text style={{textAlign:'center', fontSize:18, color:'white'}}> </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={() => {
              Linking.openURL('https://www.linkedin.com/in/alex-zoller-9969a593/')
              .catch(err => console.error('An error occurred', err));

            }}>
            <View style={{flexDirection: "row", flexWrap: "wrap"}}>
                <Icon name="linkedin" type="font-awesome" size={30} color='grey' style={{top:7}} />
                <Text style={styles.text}> Connect with the developer of ShaderVF on LinkedIn - Alex Z</Text>
                <Icon name="link" type="font-awesome" size={30} color='grey' style={{top:7}} />
                <Text style={{fontSize: 12,
    color: 'white', 
    marginTop: 10,
    marginLeft: 5, 
    marginRight: 5,}}>Lets connect on LinkedIn! I love to connect with other talented and creative developers like you!</Text>
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
          {code:
          `precision highp float;
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
          
          },
          {code:
          `precision highp float;

          varying vec3 vNormal;
          varying vec2 vTexCoord;
          uniform sampler2D uTexture;
          uniform float u_time; // Time uniform for dynamic effects
          uniform vec3 tint; // Tint color uniform
          
          void main() {
              vec3 light = normalize(vec3(1.0, 1.0, 1.0));
          
              // Waving effect
              vec2 waveTexCoord = vTexCoord;
              waveTexCoord.x += sin(waveTexCoord.y * 10.0 + u_time) * 0.02;
              waveTexCoord.y += cos(waveTexCoord.x * 10.0 + u_time) * 0.02;
          
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
          }`
          }
    

  ];


  export default MainScreen;