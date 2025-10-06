import React, { useEffect } from "react";
import { View, Platform, Alert, Button, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import * as Notifications from "expo-notifications";

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

export default function WebViewScreen({ navigation }: any) {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification tapped:", response);

        // Access custom data payload
        const screen = response.notification.request.content.data?.screen;

        // // Navigate based on the payload
        if (screen) {
          navigation.navigate(screen);
        }
      }
    );

    // Cleanup when component unmounts
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // this will handle the case when app is opened from a killed state via a notification
    const response = Notifications.getLastNotificationResponse();
    if (response) {
      const screen = response.notification.request.content.data?.screen;
      if (screen) navigation.navigate(screen);
    }
  }, []);

  type NotificationData = {
    screen?: string;
    params?: Record<string, any>;
  };

  const scheduleNotification = async (
    title: string,
    body: string,
    seconds: number,
    data?: NotificationData
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: { type: "timeInterval", seconds, repeats: false } as any,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        <WebView
          source={{ uri: "https://bilalansari.in" }}
          style={styles.webview}
          onLoadEnd={() => {
            scheduleNotification("Welcome!", "WebView is loaded", 2);
          }}
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
                btn2.innerText = 'Notify with Navigation';
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
                    4,
                    { screen: "Video" }
                  );
                }
              }
            } catch (e) {
              console.warn("Failed to parse message from WebView", e);
            }
          }}
        />
      </View>

      <View style={styles.navButton}>
        <Button
          title="Go to Video Player"
          onPress={() => navigation.navigate("Video")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  webviewContainer: { flex: 1, borderBottomWidth: 1, borderColor: "#ddd" },
  webview: { flex: 1 },
  navButton: { marginTop: 20, paddingHorizontal: 12, paddingBottom: 16 },
});
