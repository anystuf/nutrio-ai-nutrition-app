import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Image, StyleSheet, View } from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { db } from "@/config/firebase";







export function EditProfileScreen({ user, onNavigate }) {
  const display = user.displayName?.split(" ") || [];
  const [firstName, setFirstName] = useState(display[0] || "");
  const [lastName, setLastName] = useState(display.slice(1).join(" "));
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [imageurl, setImageurl] = useState(user.photoURL || "https://via.placeholder.com/150");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const name = `${firstName.trim()} ${lastName.trim()}`.trim();
      await updateProfile(user, { displayName: name, photoURL: imageurl });
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name,
        imageurl,
        height: Number(height) || undefined,
        currentWeight: Number(weight) || undefined
      }, { merge: true });
      Alert.alert("Saved", "Profile updated.");
      onNavigate({ name: "main" });
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <Header title="Edit Profile" subtitle="Update your Nutrio profile" onBack={() => onNavigate({ name: "main" })} />
      <Image source={{ uri: imageurl || "https://via.placeholder.com/150" }} style={styles.avatar} />
      <TextField label="Avatar URL" value={imageurl} onChangeText={setImageurl} icon="image-outline" />
      <TextField label="First name" value={firstName} onChangeText={setFirstName} icon="person-outline" />
      <TextField label="Last name" value={lastName} onChangeText={setLastName} icon="person-outline" />
      <TextField label="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" icon="resize-outline" />
      <TextField label="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" icon="barbell-outline" />
      <View style={styles.footer}>
        <Button onPress={save} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
      </View>
    </Screen>);

}

const styles = StyleSheet.create({
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 22
  },
  footer: {
    marginTop: 12
  }
});
