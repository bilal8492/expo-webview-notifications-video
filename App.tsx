import "react-native-gesture-handler";
import React, { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button, Platform, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WebView } from "react-native-webview";
import * as Notifications from "expo-notifications";
import type { NotificationTriggerInput } from "expo-notifications";
import { useVideoPlayer, VideoView } from "expo-video";
// Configure notification handler so notifications show when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const Stack = createNativeStackNavigator();

async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    if (Platform.OS === "web") {
      Alert.alert("Notifications not available on web in this demo");
    }
    console.warn("Notification permissions not granted");
  }
  return status;
}

function WebViewScreen({ navigation }: any) {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const scheduleNotification = async (
  title: string,
  body: string,
  seconds: number
) => {
  const trigger: Notifications.TimeIntervalTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
    seconds,
    repeats: false,
  };

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });
};

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: "https://bilalansari.in" }}
          style={styles.webview}
          onLoadEnd={() => {
            console.log("WebView content loaded");
            scheduleNotification("Welcome!", "WebView content has loaded", 2);
          }}
          // Inject two buttons into the loaded webpage which post messages to the React Native app
          injectedJavaScript={`(function() {
              function ensureButtons(){
                if (document.getElementById('rn-notify-buttons')) return;
                const container = document.createElement('div');
                container.id = 'rn-notify-buttons';
                container.style.position = 'fixed';
                container.style.left = '50%';
                container.style.transform = 'translateX(-50%)';
                container.style.bottom = '20px';
                container.style.zIndex = '999999';
                container.style.display = 'flex';
                container.style.gap = '10px';
                container.style.background = 'rgba(255,255,255,0.95)';
                container.style.padding = '8px';
                container.style.borderRadius = '8px';
                const btn1 = document.createElement('button');
                btn1.innerText = 'Notify: Quick';
                btn1.style.padding = '8px 12px';
                btn1.style.fontSize = '14px';
                btn1.onclick = function() { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'notify', which: 'quick' })); };
                const btn2 = document.createElement('button');
                btn2.innerText = 'Notify: Later';
                btn2.style.padding = '8px 12px';
                btn2.style.fontSize = '14px';
                btn2.onclick = function() { window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'notify', which: 'later' })); };
                container.appendChild(btn1);
                container.appendChild(btn2);
                document.body.appendChild(container);
              }
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', ensureButtons);
              } else {
                ensureButtons();
              }
            })(); true;`}
          onMessage={(event) => {
            try {
              const data = JSON.parse(event.nativeEvent.data);
              if (data && data.type === "notify") {
                if (data.which === "quick") {
                  scheduleNotification(
                    "Quick alert",
                    "This fired after ~2s",
                    2
                  );
                } else if (data.which === "later") {
                  scheduleNotification(
                    "Later alert",
                    "This fired after ~4s",
                    4
                  );
                }
              }
            } catch (e) {
              console.warn("Failed to parse message from WebView", e);
            }
          }}
        />
      </View>
      {/* Buttons are injected into the WebView instead of rendering natively */}
      <View style={styles.navButton}>
        <Button
          title="Go to Video Player"
          onPress={() => navigation.navigate("Video")}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

function VideoScreen({ navigation }: any) {
  const videoRef = useRef<any>(null);
  // Create a player for the HLS source
  const player = useVideoPlayer(
    "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
  );


  useEffect(() => {
    // Enable looping on the player when it's available
    try {
      if (player) player.loop = true;
    } catch (e) {
      console.warn("Failed to set player.loop", e);
    }
    return () => {
      // cleanup - if player had to be released, it would be handled automatically by the hook
    };
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
          console.log("VideoView first frame rendered");
          player.play();
        }}
      />

      <View style={styles.navButton}>
        <Button title="Back to WebView" onPress={() => navigation.goBack()} />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WebView">
        <Stack.Screen name="WebView" component={WebViewScreen} />
        <Stack.Screen name="Video" component={VideoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  webviewContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  webview: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
  },
  buttonWrap: {
    flex: 1,
    marginHorizontal: 8,
  },
  navButton: {
    marginTop: 20,
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  video: {
    width: "100%",
    height: 300,
    backgroundColor: "black",
  },
});
