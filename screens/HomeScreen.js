import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();

  // Get screen dimensions
  const screen = Dimensions.get('window');

    return (
      <View style={styles.container}>
        
        <View style={styles.textContainer}>
          <Text style={styles.text}>Welcome to ShaderVF!</Text>
          <TouchableOpacity style={{backgroundColor: 'black', padding: 20, borderRadius:20}} onPress={() => navigation.navigate('ShaderList')}>
            <Text style={{color: '#fff'}}>Go to Shaders List</Text>
          </TouchableOpacity>
        </View>
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
    position: 'relative',
    backgroundColor: '#2A2A2A'
  },
  surface: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: { 
    fontSize: 24,
    padding: 20,
    color: 'white',
  },
});
