import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Video } from 'expo-av';
import Circle from '../../assets/images/circle.svg'; // Make sure this path is correct

const Feature = () => {
  const video = React.useRef(null);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Featured Handmade Gift</Text>
      <Text style={styles.subtitle}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vitae nisl justo. Duis pretium turpis sit amet tellus vestibulum, ut consequat lacus iaculis. Donec dignissim lacus id mattis mollis.
      </Text>

      <View style={styles.videoCard}>
        {/* Circle SVG in background top-right */}
        <View style={styles.circleContainer}>
          <Circle width={80} height={80} />
        </View>

        {/* Video */}
        <Video
          ref={video}
          source={{
            uri: 'https://www.w3schools.com/html/mov_bbb.mp4', // Replace with your actual video URL or local file
          }}
          style={styles.video}
          useNativeControls
          resizeMode="cover"
          isLooping
        />
      </View>
    </View>
  );
};

export default Feature;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'mbold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#959595',
    fontFamily: 'mmedium',
    marginBottom: 30,
  },
  videoCard: {
    width: '100%',
    backgroundColor: '#EE6F69',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden', 
  },
  circleContainer: {
    position: 'absolute',
    top: 5,
    right: 40,
    zIndex: 0, 
     
  },
  video: {
    width: 280,
    height: 160,
    borderRadius: 5,
    zIndex: 1, 
  },
});
