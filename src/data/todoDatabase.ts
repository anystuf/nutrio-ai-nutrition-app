import AsyncStorage from "@react-native-async-storage/async-storage";

const todoKey = "TODOLIST";

export type TodoTask = [taskName: string, taskCompleted: boolean];

export class ToDoDataBase {
  toDoList: TodoTask[] = [];

  createInitialData() {
    this.toDoList = [
      ["Mua 500g Ức gà", false],
      ["Chuẩn bị gia vị nấu Phở", false]
    ];
  }

  async loadData() {
    const raw = await AsyncStorage.getItem(todoKey);
    if (raw) {
      this.toDoList = JSON.parse(raw) as TodoTask[];
    } else {
      this.createInitialData();
      await this.updateDataBase();
    }
    return this.toDoList;
  }

  async updateDataBase() {
    await AsyncStorage.setItem(todoKey, JSON.stringify(this.toDoList));
  }

  async addTask(taskName: string) {
    this.toDoList.push([taskName, false]);
    await this.updateDataBase();
  }

  async toggleTask(index: number) {
    if (!this.toDoList[index]) return;
    this.toDoList[index][1] = !this.toDoList[index][1];
    await this.updateDataBase();
  }

  async deleteTask(index: number) {
    this.toDoList.splice(index, 1);
    await this.updateDataBase();
  }
}
