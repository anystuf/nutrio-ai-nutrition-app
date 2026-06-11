import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { ToDoDataBase, TodoTask } from "@/data/todoDatabase";
import { colors } from "@/theme/colors";
import { AppRoute } from "@/types";

const todoDb = new ToDoDataBase();

export function ToLearnScreen({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    void todoDb.loadData().then((loadedTasks) => setTasks([...loadedTasks]));
  }, []);

  async function persist(next: TodoTask[]) {
    todoDb.toDoList = next;
    setTasks(next);
    await todoDb.updateDataBase();
  }

  function addTask() {
    if (!name.trim()) {
      Alert.alert("Task name required");
      return;
    }
    void persist([...tasks, [name.trim(), false]]);
    setName("");
  }

  return (
    <Screen scroll>
      <Header title="Cooking Tasks" subtitle="Your cooking practice list" onBack={() => onNavigate({ name: "main" })} />
      <View style={styles.composer}>
        <TextInput value={name} onChangeText={setName} placeholder="New cooking task..." placeholderTextColor="#8D988D" style={styles.input} />
        <Pressable onPress={addTask} style={styles.add}><Text style={styles.addText}>+</Text></Pressable>
      </View>
      {tasks.map((task, index) => (
        <View key={`${task[0]}-${index}`} style={styles.task}>
          <Pressable onPress={() => void persist(tasks.map((item, i) => i === index ? [item[0], !item[1]] : item))} style={[styles.checkbox, task[1] && styles.checkboxDone]}>
            <Text style={styles.check}>{task[1] ? "✓" : ""}</Text>
          </Pressable>
          <Text style={[styles.taskText, task[1] && styles.taskDone]}>{task[0]}</Text>
          <Pressable onPress={() => void persist(tasks.filter((_, i) => i !== index))}><Text style={styles.delete}>Delete</Text></Pressable>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  composer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 18
  },
  input: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text
  },
  add: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900"
  },
  task: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  checkboxDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  check: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  taskText: {
    flex: 1,
    color: colors.text,
    fontWeight: "800"
  },
  taskDone: {
    textDecorationLine: "line-through",
    color: colors.textMuted
  },
  delete: {
    color: colors.danger,
    fontWeight: "800"
  }
});
