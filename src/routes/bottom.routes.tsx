import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../pages/dashboard';
import Config from '../pages/config';
import CustomTabBar from '../components/customTabBar';

const Tab = createBottomTabNavigator();

export default function BottomRoutes(){
    return(
        <Tab.Navigator
            screenOptions={{
                headerShown:false
            }}
            tabBar={pros=>< CustomTabBar {...pros}/>}
        >
            
            <Tab.Screen
            name="Dashboard"
            component={Dashboard}
            />
            <Tab.Screen
            name="Config"
            component={Config}
            />
        </Tab.Navigator>
    )
}

