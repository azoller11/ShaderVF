import React, { useState } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
// Assuming models, textures, and shaders are defined outside and imported correctly
// Import statements for models, textures, and shaders arrays should be here

const SetupSceneScreen = () => {
    const models = [
        { id: 'model1', name: 'Model 1' },
        { id: 'model2', name: 'Model 2' },
        // Add more models
      ];
      
      const textures = [
        { id: 'texture1', name: 'Texture 1', thumbnail: 'texture1-thumbnail.jpg' },
        { id: 'texture2', name: 'Texture 2', thumbnail: 'texture2-thumbnail.jpg' },
        // Add more textures
      ];
      
      const shaders = [
        { id: 'shader1', name: 'Shader 1' },
        { id: 'shader2', name: 'Shader 2' },
        // Add more shaders
      ];
      
  const [selectedModel, setSelectedModel] = useState(models.length > 0 ? models[0].id : '');
  const [selectedTexture, setSelectedTexture] = useState(textures.length > 0 ? textures[0].id : '');
  const [selectedShader, setSelectedShader] = useState(shaders.length > 0 ? shaders[0].id : '');

  // Conditional rendering check before mapping
  const renderModels = models.length > 0 ? models.map((model) => (
    <Picker.Item key={model.id} label={model.name} value={model.id} />
  )) : <Picker.Item label="No models available" value="" />;

  const renderTextures = textures.length > 0 ? textures.map((texture) => (
    <Button key={texture.id} title={texture.name} onPress={() => setSelectedTexture(texture.id)} />
  )) : <Text>No textures available</Text>;

  const renderShaders = shaders.length > 0 ? shaders.map((shader) => (
    <Button key={shader.id} title={shader.name} onPress={() => setSelectedShader(shader.id)} />
  )) : <Text>No shaders available</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Other components remain unchanged */}
      
      <Text style={styles.label}>Select Model:</Text>
      <Picker
        selectedValue={selectedModel}
        onValueChange={(itemValue) => setSelectedModel(itemValue)}>
        {renderModels}
      </Picker>

      <Text style={styles.label}>Select Texture:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {renderTextures}
      </ScrollView>

      <Text style={styles.label}>Select Shader:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {renderShaders}
      </ScrollView>

      {/* Rest of your component */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewPlaceholder: {
    marginTop: 20,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
});

export default SetupSceneScreen;
