import React, { useState, useRef } from 'react';
import { View, Text, Switch, Button, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { GLView } from 'expo-gl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';

const SettingsScreen = () => {
    const [isEnabled, setIsEnabled] = useState(false);
    const glViewRef = useRef(null);
    const navigation = useNavigation();
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    const clearGLContext = () => {
        const gl = glViewRef.current;
        if (gl) {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            console.log('Cleared GL Buffer');
            
            // Additional reset logic can go here
        }
    };

/*
 <View style={styles.settingItem}>
                <Text style={styles.settingText}>Enable Feature</Text>
                <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
                
            </View>
*/

    return (
        
        <ScrollView style={styles.container}>
              <View style={{position: 'absolute', top:60,left:25}}>
            
            <TouchableOpacity style={[{top:0}]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" type="material-community" size={30} color='#ffcc0c'style={{}}  />
        </TouchableOpacity>
            </View>
            <View style={styles.buttonContainer}>
                <Button title="Clear GL Context" onPress={clearGLContext} />
            </View>
            <GLView style={styles.hiddenGLView} onContextCreate={context => glViewRef.current = context} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor:'#121212'
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    settingText: {
        fontSize: 18,
    },
    buttonContainer: {
        padding: 20,
    },
    hiddenGLView: {
        width: 1,
        height: 1,
    },
   
    
});

export default SettingsScreen;
