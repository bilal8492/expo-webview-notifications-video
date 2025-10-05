import React, { useEffect, useRef, useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

export default function VideoScreen({ navigation }: any) {
  const videoRef = useRef<any>(null);
  const player = useVideoPlayer('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');

  useEffect(() => {
    try {
      if (player) player.loop = true;
    } catch (e) {
      console.warn('Failed to set player.loop', e);
    }
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        ref={videoRef}
        style={styles.video}
        player={player}
        nativeControls={true}
        contentFit="contain"
        onFirstFrameRender={() => {
          player.play();
        }}
      />

      <View style={styles.navButton}>
        <Button title="Back to WebView" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  video: { width: '100%', height: 300, backgroundColor: 'black' },
  navButton: { marginTop: 20, paddingHorizontal: 12, paddingBottom: 16 },
});
