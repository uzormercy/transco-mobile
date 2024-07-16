import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import TranslatorScreen from "@/components/Translator";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity>
          <Ionicons name="menu" size={28} color="#3B5845" />
        </TouchableOpacity>
        <Text style={styles.title}>Transo.</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={28} color="#3B5845" />
        </TouchableOpacity>
      </View>
      <TranslatorScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECEC",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B5845",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#3B5845",
    textAlign: "center",
    marginVertical: 20,
  },
});

export default HomeScreen;
