import { StyleSheet, View } from 'react-native';

import Routes from './src/routes/index.routes';
import {NavigationContainer} from '@react-navigation/native';

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Routes/>

      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
