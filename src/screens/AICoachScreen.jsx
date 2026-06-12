
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import {
  coachPrompts,
  dailyReminderMessages,
  fixedIngredientSchedule,
  scriptedReply } from
"@/features/aiCoach/aiCoachScripts";
import { generateGeminiText } from "@/services/gemini";
import { colors } from "@/theme/colors";















export function AICoachScreen({ user, onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const ref = collection(db, "users", user.uid, "chats");
    const q = query(ref, orderBy("timestamp", "asc"));
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
    });
  }, [user.uid]);

  useEffect(() => {
    const timers = dailyReminderMessages.map((reminder) => {
      const now = new Date();
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), reminder.hour, reminder.minute, 0);
      if (now > target) target.setDate(target.getDate() + 1);
      return setTimeout(() => {
        void addBotMessage(reminder.text);
      }, target.getTime() - now.getTime());
    });

    return () => timers.forEach(clearTimeout);
  }, [user.uid]);

  async function addBotMessage(nextText, quickReplies = []) {
    await addDoc(collection(db, "users", user.uid, "chats"), {
      sender: "bot",
      text: nextText,
      type: "text",
      quick_replies: quickReplies,
      timestamp: serverTimestamp()
    });
  }

  async function send(nextText) {
    const clean = nextText.trim();
    if (!clean) return;

    setText("");
    setLoading(true);
    const ref = collection(db, "users", user.uid, "chats");
    try {
      await addDoc(ref, { sender: "user", text: clean, timestamp: serverTimestamp() });
      const scripted = scriptedReply(clean);
      if (scripted) {
        await addBotMessage(scripted.text, scripted.quickReplies ?? []);
        return;
      }

      const answer = await generateGeminiText([
      "You are Nutrio Coach, a friendly Vietnamese nutrition and fitness assistant.",
      "Give safe, practical advice about calories, macros, meal planning, workouts, hydration, and food logging.",
      "Keep answers concise and use Vietnamese when the user writes Vietnamese.",
      `User: ${clean}`].
      join("\n"));
      await addDoc(ref, { sender: "bot", text: answer, timestamp: serverTimestamp() });
    } catch (error) {
      Alert.alert("AI Coach failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function pickIngredientsImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: false,
      quality: 0.8
    });

    if (result.canceled) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "chats"), {
        sender: "user",
        text: "📷 Đã gửi ảnh thành phần món ăn",
        type: "text",
        image: result.assets[0]?.uri ?? "",
        timestamp: serverTimestamp()
      });
      await addBotMessage(fixedIngredientSchedule, ["Lưu vào nhật ký ăn uống cho tôi."]);
    } catch (error) {
      Alert.alert("Không thể gửi ảnh", error instanceof Error ? error.message : "Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen style={styles.screen}>
      <Header title="Nutrio Coach" subtitle="Gemini-powered meal and training assistant" onBack={() => onNavigate({ name: "main" })} />
      <View style={styles.promptRow}>
        {coachPrompts.map((prompt) =>
        <Pressable key={prompt} onPress={() => void send(prompt)} style={styles.promptChip}>
            <Text style={styles.promptText}>{prompt}</Text>
          </Pressable>
        )}
        {["Mã ưu đãi", "Đăng ký thành viên", "Đổi điểm"].map((prompt) =>
        <Pressable key={prompt} onPress={() => void send(prompt)} style={[styles.promptChip, styles.darkChip]}>
            <Text style={styles.darkChipText}>{prompt}</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.chat}>
        {messages.length === 0 ? <Text style={styles.empty}>Ask Nutrio Coach anything about food, macros, or workouts.</Text> : null}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(message) => message.id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item: message }) =>
          <View style={[styles.bubble, message.sender === "user" ? styles.userBubble : styles.botBubble]}>
              <Text style={styles.bubbleText}>{message.text}</Text>
              {message.quick_replies?.length ?
            <View style={styles.replyRow}>
                  {message.quick_replies.map((reply) =>
              <Pressable key={reply} style={styles.reply} onPress={() => void send(reply)}>
                      <Text style={styles.replyText}>{reply}</Text>
                    </Pressable>
              )}
                </View> :
            null}
            </View>
          } />
        
      </View>
      <View style={styles.composer}>
        <Pressable style={styles.imageButton} onPress={() => void pickIngredientsImage()}>
          <Text style={styles.imageButtonText}>+</Text>
        </Pressable>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Nhắn với Coach..."
          placeholderTextColor="#8D988D"
          style={styles.input}
          onSubmitEditing={() => void send(text)} />
        
        <Button onPress={() => void send(text)} disabled={loading} style={styles.send}>{loading ? "..." : "Send"}</Button>
      </View>
    </Screen>);

}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  promptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12
  },
  promptChip: {
    backgroundColor: colors.surface,
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  promptText: {
    color: colors.primaryDark,
    fontWeight: "800",
    fontSize: 12
  },
  darkChip: {
    backgroundColor: "#2C2C2C",
    borderColor: "#2C2C2C"
  },
  darkChipText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12
  },
  chat: {
    flex: 1,
    minHeight: 0
  },
  chatContent: {
    gap: 10,
    paddingBottom: 8
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 40
  },
  bubble: {
    borderRadius: 14,
    padding: 12,
    maxWidth: "86%"
  },
  userBubble: {
    backgroundColor: "#DDF3D9",
    alignSelf: "flex-end"
  },
  botBubble: {
    backgroundColor: colors.surface,
    alignSelf: "flex-start"
  },
  bubbleText: {
    color: colors.text,
    lineHeight: 20
  },
  replyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10
  },
  reply: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  replyText: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 12
  },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 12
  },
  imageButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  imageButtonText: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 25,
    lineHeight: 28
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text
  },
  send: {
    width: 78,
    minHeight: 48
  }
});
