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
  let startTime = Date.now();


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
        //console.log(selectedShader);
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
            name: "Spherical Fractal",
            description: "Global",
            code: '',
            author: 'Alex',
          }
          let shaderData2 = {
            name: "Test Global2",
            description: "Global2",
            code: code,
            author: 'Alex2',
          }
          setShaders(preSavedShaders);
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
        {global==false && (

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
          )

        )}
        

        

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
            {false && (
              <TouchableOpacity style={{}} onPress={() => console.log('push to global')}>
                <Icon name="globe" type="font-awesome" size={30} color='#3366CC' />
              </TouchableOpacity>
            )}
            
            {global==true && (
              <TouchableOpacity style={{}} onPress={() => saveItem(item)}>
                <Icon name="save" type="font-awesome" size={30} color='#3366CC' />
              </TouchableOpacity>
            )}


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
  
const preSavedShaders = [
   {
    name: "Spherical Fractal",
    description: "Colorful spherical fractal demenstration",
    code: `precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;
    
    #define time 0.25 * u_time
    #define c cos(time)
    #define s sin(time)
    
    #define hue2rgb(h) 0.6 + 0.6 * cos(6.3 * h + vec3(0.0 ,23.0, 21.0))
    
    float mapScene(in vec3 p) {
        mat2 r = mat2(c, -s, s, c);
        float scale = 1.0;
        float d = 1000000.0;
    
        float iters = 7.0;
        for (float iter=0.0; iter < iters; iter++) {
            d = min(d, (length(p) - 2.5) / scale);
            p.yz *= r * mat2(0.816496580928, -0.57735026919, 0.57735026919, 0.816496580928);
            p.xz *= r * mat2(0.707106781187, -0.707106781187, 0.707106781187, 0.707106781187);
            p = abs(p) - 2.0;
            p *= 2.5;
            scale *= 2.5;
        }
    
        return d;
    }
    
    vec3 getNormal(in vec3 p) {
        return normalize(vec3(mapScene(p + vec3(0.001, 0.0, 0.0)) - mapScene(p - vec3(0.001, 0.0, 0.0)),  
                              mapScene(p + vec3(0.0, 0.001, 0.0)) - mapScene(p - vec3(0.0, 0.001, 0.0)),  
                              mapScene(p + vec3(0.0, 0.0, 0.001)) - mapScene(p - vec3(0.0, 0.0, 0.001))));}
    
    void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    
        vec3 ro = vec3(0.0, 0.0, 10.0);
        vec3 rd = normalize(vec3(uv, -1.0));
    
        float dt = 0.0;
        for (int iter=0; iter < 150; iter++) {
            vec3 p = ro + rd * dt;
    
            float d = mapScene(p);
            if (d < 0.001) {
                vec3 n = getNormal(p);
                vec3 l = vec3(-0.57735026919, 0.57735026919, 0.57735026919);
    
                gl_FragColor.rgb += hue2rgb(0.2 * length(p));
                gl_FragColor.rgb *= max(0.3, dot(n, l));
                break;
            }
    
            if (dt > 20.0) {
                break;
            }
    
            dt += d;
        }
    }`,
    author: 'Alex',
  },

  {
    name: "Home Screen",
    description: "Source code for homescreen effect",
    code: ` precision highp float;

    // Width and height of the shader
    uniform vec2 u_resolution;
    
    // Time elapsed
    uniform float u_time;
    
    // Constants
    #define PI 3.1415925359
    #define TWO_PI 6.2831852
    
    void main()
    {
        float iGlobalTime = u_time;
        vec2 iResolution = u_resolution;
        float time = iGlobalTime * 2.0;
    
        // Adjust the scale of UVs for smoother patterns
        vec2 uv = (gl_FragCoord.xy / iResolution.xx - 0.5) * 4.0;
        vec2 uv0 = uv;
    
        float i0 = 1.0;
        float i1 = -1.0;
        float i2 = 0.5;
        float i4 = -1.0;
    
        for (int s = 0; s < 4; s++) // Reduced iterations to 4 for lesser complexity
        {
            vec2 r;
            r = vec2(cos(uv.y * i0 - i4 + time / (i1 * 4.0)), sin(uv.x * i0 - i4 + time / (i1 * 4.0))) / (i2 * 2.0);
            r += vec2(-r.y, r.x) * 0.1;  // Reduced distortion
            uv.xy += r;
    
            i0 *= 1.5;
            i1 *= 1.2;
            i2 *= 1.4;
            i4 += 0.03; // Reduced time's effect
        }
    
        float r = sin(uv.x - time * 0.5) * 0.5 + 0.5; // Slowed down the time's effect on colors
        float b = sin(uv.y + time * 0.5) * 0.5 + 0.5; // Same here
        float g = sin((uv.x + uv.y + sin(time * 0.25)) * 0.5) * 0.5 + 0.5; // And here
        gl_FragColor = vec4(r, g, b, 1.0);
    }`,
    author: 'Alex',
  },
  {
    name: "Rotating Blocks",
    description: "Endless rotating grey squares",
    code: `precision highp float;

    uniform vec2 u_resolution;       
    uniform float u_time;
    
    #define PI 3.1415925359
    #define TWO_PI 6.2831852
    
    mat2 rot(float r){
        return mat2(cos(r),-sin(r),sin(r),cos(r));
    }
    
    float box(vec3 p, vec3 b){
        vec3 q=abs(p)-b;
        return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);
    }
    
    /*vec3 norm(vec3 p){
        vec2 e = vec2(.0001,0.);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),
                              map(p+e.yxy)-map(p-e.yxy),
                              map(p+e.yyx)-map(p-e.yyx)));
    }*/
    
    void main(){
        vec2 uv = (gl_FragCoord.xy-.5*u_resolution)/u_resolution.y;
    
        vec3 ro = vec3(2.5,0.,u_time);
        vec3 rd = normalize(vec3(uv,1.));
    
        float d = 0.;
        float e = 0.;
        vec3 p = vec3(0.);
        for(int i=0;i<100;i++) {
            p=ro+rd*d;
            float o=fract(dot(floor((p-2.5)/5.)*5.,vec3(1.123,2.876,9.345)));
            float q=u_time*.5+o;
            q=floor(q)+.5+.5*cos(PI*exp(-10.*fract(q)));
            p=mod(p-2.5,5.)-2.5;
            if(o>.333)p.xz*=rot(q*PI*.5);
            if(o>.666)p.xy*=rot(q*PI*.5);
            p.yz*=rot(q*PI*.5);
            float t=box(p,vec3(1.));
            d+=t;
            e+=exp(abs(-t));
            if(t<0.001)break;
            if(d>1000.0){
                gl_FragColor = vec4(0.);
                return;
            }
        }
        float f = min(exp((10.-d)*0.1),1.);
        vec3 col = vec3(e*.01*f);
    
        gl_FragColor = vec4(col,1.);
    }`,
    author: 'Alex',
  },
  
  {
    name: "Mandelbrot",
    description: "Example of the Mandelbrot equation",
    code: `precision mediump float;

    uniform vec2 u_resolution;
    
    // Function to compute the Mandelbrot iteration
    vec3 mandelbrot(vec2 p) {
        vec2 z = p;
        int iter = 0;
        const int maxIter = 256;
        while (length(z) < 4.0 && iter < maxIter) {
            float x = (z.x * z.x - z.y * z.y) + p.x;
            float y = (2.0 * z.x * z.y) + p.y;
            z = vec2(x, y);
            iter++;
        }
        if (iter == maxIter) return vec3(0.0); // Black if inside the Mandelbrot set
        // Otherwise return a color based on the number of iterations
        float norm = float(iter) / float(maxIter);
        return vec3(norm, sqrt(norm), pow(norm, 0.5));
    }
    
    void main() {
        // Normalize coordinates
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.y, u_resolution.x);
        
        // Mandelbrot set is typically visualized in the range -2.0 to 2.0 on both axes
        vec2 mandelbrotCoords = vec2(2.5 * uv.x, 2.5 * uv.y);
        vec3 color = mandelbrot(mandelbrotCoords);
    
        gl_FragColor = vec4(color, 1.0);
    }
    `,
    author: 'Alex',
  }
  ,
  
  {
    name: "Julia Set",
    description: "Julia Set Example",
    code: `
    
    precision mediump float;

uniform vec2 u_resolution;

// Define a constant complex number for the Julia Set
const vec2 c = vec2(0.355, 0.355);

// Function to compute the Julia Set iteration
vec3 julia(vec2 p) {
    vec2 z = p;
    int iter = 0;
    const int maxIter = 256;
    while (length(z) < 4.0 && iter < maxIter) {
        float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (2.0 * z.x * z.y) + c.y;
        z = vec2(x, y);
        iter++;
    }
    if (iter == maxIter) return vec3(0.0); // Black if inside the Julia set
    // Otherwise return a color based on the number of iterations
    float norm = float(iter) / float(maxIter);
    return vec3(norm, sqrt(norm), pow(norm, 0.5));
}

void main() {
    // Normalize coordinates
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.y, u_resolution.x);
    
    // Julia set is also typically visualized in the range -2.0 to 2.0 on both axes
    vec2 juliaCoords = vec2(2.5 * uv.x, 2.5 * uv.y);
    vec3 color = julia(juliaCoords);

    gl_FragColor = vec4(color, 1.0);
}

    
    `,
    author: 'Alex',
  }
  ,
  
  {
    name: "Sierpinski Triangle",
    description: "Sierpinski Triangle Example",
    code: `
    precision mediump float;

uniform vec2 u_resolution;

vec3 sierpinski(vec2 p) {
    int iter = 0;
    const int maxIter = 10;
    
    for (int i = 0; i < maxIter; i++) {
        if (p.y > 0.5) {
            p = 2.0 * p - vec2(1.0, 1.0);
        } else if (p.x < 0.5) {
            p = 2.0 * p;
        } else {
            p = 2.0 * p - vec2(1.0, 0.0);
        }
        
        if (p.x > 0.5 && p.y < 0.5) {
            return vec3(0.0);
        }
        
        iter++;
    }
    
    float norm = float(iter) / float(maxIter);
    return vec3(norm, norm, 0.5);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec3 color = sierpinski(uv);
    
    gl_FragColor = vec4(color, 1.0);
}

    `,
    author: 'Alex',
  }
  ,
  
 
  
  {
    name: "Sierpinski Carpet",
    description: "Sierpinski Carpet Example",
    code: `
    precision mediump float;

    uniform vec2 u_resolution;
    
    vec3 sierpinskiCarpet(vec2 p) {
        int iter = 0;
        const int maxIter = 5;
        
        for (int i = 0; i < maxIter; i++) {
            if (mod(p.x, 3.0) > 1.0 && mod(p.y, 3.0) > 1.0) {
                return vec3(0.0); // Black hole in the carpet
            }
            p = mod(3.0*p, 3.0);
        }
        
        return vec3(1.0); // White part of the carpet
    }
    
    void main() {
        vec2 uv = 3.0 * (gl_FragCoord.xy / u_resolution.xy);
        
        vec3 color = sierpinskiCarpet(uv);
        
        gl_FragColor = vec4(color, 1.0);
    }
    

    `,
    author: 'Alex',
  },

  {
    name: "Koch Snowflake",
    description: "Koch Snowflake Example",
    code: `
    precision mediump float;

uniform vec2 u_resolution;

float kochSnowflake(vec2 p) {
    p = abs(p);  // Reflect over both axes

    // Rotate around the origin by -PI/6 to get the right orientation
    float a = -3.14159265359 / 6.0;
    p = mat2(cos(a), -sin(a), sin(a), cos(a)) * p;

    // Repeatedly scale and reflect point to get its position in a unit triangle
    for (int i = 0; i < 5; i++) {
        if (p.x + p.y > 1.0) {
            p = vec2(1.0) - p;  // Reflect point over y = -x + 1
        }
        p *= 2.0;  // Scale up by 2

        if (p.x + p.y > 1.0) {
            p.y -= 1.0;  // Wrap around for next iteration
        }
    }

    // Return the distance to the curve
    return min(p.y, 1.0 - p.x - p.y);
}

void main() {
    vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 2.0 - vec2(1.0);
    uv.y *= u_resolution.y / u_resolution.x;

    float d = kochSnowflake(uv);

    // Coloring
    vec3 color = d < 0.01 ? vec3(0.0) : vec3(1.0);

    gl_FragColor = vec4(color, 1.0);
}

    
    `,
    author: 'Alex',
  }

  ,


  {
    name: "Barnsley Fern",
    description: "Barnsley Fern Example",
    code: `precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;

    // These functions represent affine transformations
    vec2 f1(vec2 p) {
        return 0.85 * mat2(0.85, 0.04, -0.04, 0.85) * p + vec2(0.0, 1.6);
    }

    vec2 f2(vec2 p) {
        return 0.2 * mat2(-0.15, 0.28, 0.26, 0.24) * p + vec2(0.0, 0.44);
    }

    vec2 f3(vec2 p) {
        return 0.15 * mat2(0.2, 0.26, -0.26, 0.28) * p + vec2(0.0, 0.44);
    }

    vec2 f4(vec2 p) {
        return vec2(0.0, 0.16 * p.y);
    }

    vec3 barnsleyFern(vec2 p) {
        // Sample color for visualization
        vec3 col = vec3(0.0);

        for (int i = 0; i < 5; i++) {
            float r = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);

            if (r < 0.85) {
                p = f1(p);
                col = vec3(0.0, 0.5, 0.0); // Green color
            } else if (r < 0.92) {
                p = f2(p);
                col = vec3(0.8, 0.4, 0.3); // Reddish color
            } else if (r < 0.99) {
                p = f3(p);
                col = vec3(0.9, 0.9, 0.9); // Light gray color
            } else {
                p = f4(p);
                col = vec3(0.0, 0.2, 0.0); // Dark Green color
            }
        }

        return col;
    }

    void main() {
        vec2 uv = (gl_FragCoord.xy / u_resolution.xy) * 6.0 - vec2(3.0, 6.0);
        uv.y *= u_resolution.y / u_resolution.x;

        vec3 color = barnsleyFern(uv);

        gl_FragColor = vec4(color, 1.0);
    }

    
    `,
    author: 'Alex',
  }

  ,

  {
    name: "Mandelbrot Zoom",
    description: "Animated Example of the Mandelbrot equation",
    code: `precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;
    
    // Function to compute the Mandelbrot iteration
    vec3 mandelbrot(vec2 p) {
        vec2 z = p;
        int iter = 0;
        const int maxIter = 256;
        while (length(z) < 4.0 && iter < maxIter) {
            float x = (z.x * z.x - z.y * z.y) + p.x;
            float y = (2.0 * z.x * z.y) + p.y;
            z = vec2(x, y);
            iter++;
        }
        if (iter == maxIter) return vec3(0.0); 
        float norm = float(iter) / float(maxIter);
        return vec3(norm, sqrt(norm), pow(norm, 0.5));
    }
    
    void main() {
        // Normalize coordinates
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.y, u_resolution.x);
        
        // Continuous zoom effect
        float zoomSpeed = 0.1; 
        float zoomLevel = mod(u_time * zoomSpeed, 10.0); // Here we limit the zoom to a range, then loop it
        float zoom = pow(1.5, zoomLevel); // Exponential zoom effect
        vec2 zoomedCoords = uv / zoom;
        
        // Mandelbrot set with zoom
        vec2 mandelbrotCoords = vec2(2.5 * zoomedCoords.x, 2.5 * zoomedCoords.y);
        vec3 color = mandelbrot(mandelbrotCoords);
    
        gl_FragColor = vec4(color, 1.0);
    }`,
    author: 'Alex',
  }
 

]


  export default ShaderListScreen;