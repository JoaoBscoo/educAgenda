import React from "react";
import { Text, Touchable, TouchableOpacity, View} from "react-native";
import { style } from "../../components/customTabBar/styles";
import { AntDesign } from "@expo/vector-icons";


export default ({state,navigation})=>{
    return (
        <View style={style.tabArea}>
            <TouchableOpacity style={style.tabItem}>
                <AntDesign
                    name="aim"
                    size={30}
                
                />
            </TouchableOpacity>

            <TouchableOpacity style={style.tabItem}>
                <AntDesign
                    name="appstore"
                    style={{fontSize:30}}
                
                />
            </TouchableOpacity>

            <TouchableOpacity style={style.tabItem}>
                <AntDesign
                    name="menu"
                    style={{fontSize:30}}
                
                />
            </TouchableOpacity>


        </View>
    )
}