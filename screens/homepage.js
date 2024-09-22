import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    StatusBar
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS, SHADOW } from "../constants";

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.OS === "ios" ? 40 : StatusBar.currentHeight + 10,
        flex: 1,
        backgroundColor: COLORS.primary,
        padding: SIZES.padding
    },
    textBoxWrapper: {
        width: "100%",
        position: "absolute",
        bottom: 0,
        left: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: SIZES.padding
    },
    textInput: {
        ...SHADOW,
        borderRadius: SIZES.textBoxRadius,
        backgroundColor: COLORS.secondary,
        height: 42,
        paddingLeft: 15,
        width: "90%",
        color: COLORS.primary,
        marginRight: 15,
        ...FONTS.h2_semiBold,
    },
    btn: {
        ...SHADOW,
        backgroundColor: COLORS.accent,
        height: 42,
        width: 42,
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center",
    },
    deleteIcon: {
        position: 'absolute',
        bottom: 70,
        right: 20,
        backgroundColor: COLORS.accent,
        padding: 15,
        borderRadius: 50,
        ...SHADOW,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1, 
    },
    card: {
        ...SHADOW,
        width: '100%',
        paddingVertical: 10,
        paddingHorizontal: SIZES.padding,
        borderRadius: SIZES.borderRadius,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        marginBottom: 15,
    },
    cardText: {
        ...FONTS.h2_semiBold,
        color: COLORS.primary,
        flex: 1,
    },
    checkbox: {
        marginRight: 15,
    }
});

export default function Homepage() {
    const [list, setList] = useState([]);
    const [value, setValue] = useState("");
    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    // Ladataan tiedot AsyncStorage:sta
    const loadData = async () => {
        try {
            const savedList = await AsyncStorage.getItem('todoList');
            if (savedList !== null) {
                setList(JSON.parse(savedList));
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Tallennetaan tiedot AsyncStorage:en
    const saveData = async (newList) => {
        try {
            await AsyncStorage.setItem('todoList', JSON.stringify(newList));
        } catch (error) {
            console.log(error);
        }
    };

    // Uuden tehtävän lisääminen
    const addText = (text) => {
        if (value !== "") {
            const newList = [
                ...list,
                { text: text, isSelected: false }
            ];
            setList(newList);
            saveData(newList);
            setValue("");
        } else {
            alert("Kirjoita jotain ensin!");
        }
    };

    // Checkboxin tilan päivittäminen
    const setIsSelected = (index, value) => {
        let updatedList = [...list];
        updatedList[index].isSelected = value;
        setList(updatedList);
        saveData(updatedList);
    };

    // Poista kaikki valitut tehtävät
    const deleteSelectedTasks = () => {
        Alert.alert(
            "Delete Selected Tasks",
            "Are you sure you want to delete all selected tasks?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes", onPress: () => {
                        const updatedList = list.filter(item => !item.isSelected);
                        setList(updatedList);
                        saveData(updatedList);
                        setSelectedTask(null);
                    }
                }
            ]
        );
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedTask(index)}
        >
            <Checkbox
                style={styles.checkbox}
                value={item.isSelected}
                onValueChange={(value) => setIsSelected(index, value)} 
            />
            <Text
                style={{
                    ...styles.cardText,
                    textDecorationLine: item.isSelected ? "line-through" : "none"
                }}
            >
                {item.text}
            </Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.container}>
                <Text style={{ ...FONTS.h1_semiBold, color: COLORS.secondary, marginBottom: 15 }}>
                    What needs to be done.
                </Text>
                <FlatList
                    style={{ flex: 1 }}
                    data={list}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                />

                <View style={styles.textBoxWrapper}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="New Task"
                        placeholderTextColor={COLORS.primary}
                        onChangeText={text => setValue(text)}
                        value={value}
                    />
                    <TouchableOpacity
                        style={styles.btn}
                        onPress={() => addText(value)}
                    >
                        <Text style={{ fontSize: 34, color: COLORS.secondary }}>+</Text>
                    </TouchableOpacity>
                </View>

                {/* Näytetään roskakori-kuvake vain, jos ainakin yksi tehtävä on valittuna */}
                {list.some(item => item.isSelected) && (
                    <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={deleteSelectedTasks}
                    >
                        <Ionicons name="trash-outline" size={28} color={COLORS.secondary} />
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
}
