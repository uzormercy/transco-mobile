import React, { useEffect, useState } from "react";
import debounce from "lodash/debounce";
import { Picker } from "@react-native-picker/picker";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

type Language = {
  label: string;
  value: string;
};

type TLanguageResponse = {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

const TranslatorScreen = () => {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [languageFrom, setLanguageFrom] = useState<Language | undefined>(
    undefined
  );
  const [languageTo, setLanguageTo] = useState<Language | undefined>(undefined);

  const handleLanguageFromChange = (value: string) => {
    const selectedLanguage = languages.find(
      (language) => language.value === value
    );
    setLanguageFrom(selectedLanguage as Language);
  };

  const handleLanguageToChange = (value: string) => {
    const selectedLanguage = languages.find(
      (language) => language.value === value
    );
    setLanguageTo(selectedLanguage as Language);
  };

  const swapLanguages = () => {
    if (!languageFrom || !languageTo) return;
    const tempLanguage = languageFrom;
    setLanguageFrom(languageTo);
    setLanguageTo(tempLanguage);

    const tempText = text;
    setText(translatedText);
    setTranslatedText(tempText);
  };

  const handleTranslation = async (text: string) => {
    setText(text);
    // get the selected languageFrom and Language to translate to
    const languageToTranslateFrom: string = languageFrom?.value || "";
    const languageToTranslateTo: string = languageTo?.value || "";
    if (!languageFrom || !languageTo) return;

    // call the translate function
    const debounceTranslate = debounce(async () => {
      const translated = await translate(
        text,
        languageToTranslateFrom,
        languageToTranslateTo
      );
      if (translated) {
        console.log("Translated text:", translated);
        setTranslatedText(translated.word);
      }
    }, 300);

    debounceTranslate();
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied to clipboard!",
    });
  };

  const playAudio = (text: string) => {
    Speech.speak(text, {
      language: languageTo?.value,
    });
  };

  const getLanguages = async (): Promise<Language[]> => {
    try {
      const response = await fetch("http://192.168.1.147:3000/api/languages");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.data.map((language: TLanguageResponse) => ({
        label: language.name,
        value: language.id,
      }));
    } catch (error) {
      console.error("Error fetching languages:", error);
      return [];
    }
  };

  const translate = async (text: string, from: string, to: string) => {
    // call the translate function
    console.log("Translating from", from, "to", to, "text", text);
    const response = await fetch(`http://192.168.1.147:3000/api/translate/`, {
      method: "POST",
      body: JSON.stringify({ word: text, from, to }),
    });
    const data = await response.json();
    // if (data.status === "success") {
    //   console.log("Translated data:", data);
    //   return data.data;
    // }

    return data?.data[0];
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      const languages = await getLanguages();
      setLanguages(languages);
      if (languages.length > 0) {
        setLanguageFrom(languages[0]);
        setLanguageTo(languages[languages.length - 1]);
      }
    };

    fetchLanguages();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.languageSelector}>
        <Picker
          selectedValue={languageFrom?.value}
          onValueChange={(itemValue) => handleLanguageFromChange(itemValue)}
          style={styles.picker}
        >
          {languages.map((language) => (
            <Picker.Item
              key={language.value}
              label={language.label}
              value={language.value}
              style={{
                textTransform: "capitalize",
              }}
            />
          ))}
        </Picker>
        <TouchableOpacity onPress={swapLanguages}>
          <Text style={styles.swapButton}>⇄</Text>
        </TouchableOpacity>
        <Picker
          selectedValue={languageTo?.value}
          onValueChange={(itemValue) => handleLanguageToChange(itemValue)}
          style={styles.picker}
        >
          {languages
            .slice()
            .reverse()
            .map((language) => (
              <Picker.Item
                key={language.value}
                label={language.label}
                value={language.value}
              />
            ))}
        </Picker>
      </View>
      <View style={styles.translationContainer}>
        <View style={styles.textInputHeader}>
          <Text style={styles.label}>Translate From</Text>
          <Text style={styles.label}>{languageFrom?.label}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            value={text}
            onChangeText={handleTranslation}
            selectionColor="#ffffff"
          />
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => playAudio(text)}>
              <Feather
                name="volume-2"
                style={{
                  ...styles.icon,
                  color: "#FFFFFF",
                }}
                size={15}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => copyToClipboard(text)}>
              <Feather
                name="copy"
                size={15}
                style={{
                  ...styles.icon,
                  color: "#FFFFFF",
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.textInputHeader}>
          <Text style={styles.label}>Translate To</Text>
          <Text style={styles.label}>{languageTo?.label}</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInputResult}
            multiline
            value={translatedText}
            editable={false}
          />
          <View style={styles.iconContainer}>
            <TouchableOpacity onPress={() => playAudio(translatedText)}>
              <Feather name="volume-2" style={styles.icon} size={15} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => copyToClipboard(translatedText)}>
              <Feather name="copy" size={15} style={styles.icon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  languageSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  picker: {
    flex: 1,
    height: 50,
    textTransform: "capitalize",
  },
  swapButton: {
    fontSize: 24,
    marginHorizontal: 10,
  },
  translationContainer: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    flexShrink: 1,
  },
  textInput: {
    height: 100,
    borderColor: "#3a7460",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#3a7460",
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    color: "#FFFFFF",
    paddingBottom: 40,
  },
  textInputResult: {
    minHeight: 100,
    borderColor: "#f5f5f5",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    color: "#000000",
    paddingBottom: 45,
  },
  textInputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  inputContainer: {
    position: "relative",
  },
  iconContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 25,
    right: 10,
  },
  icon: {
    marginLeft: 10,
  },
});

export default TranslatorScreen;
