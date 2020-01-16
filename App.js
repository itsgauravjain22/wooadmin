import React, { Component } from 'react';
import { StatusBar, Platform, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Container } from 'native-base';
import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { Ionicons} from '@expo/vector-icons';
import AppHeader from './src/components/commoncomponents/header.js';
import AppFooter from './src/components/commoncomponents/footer.js';
import ProductsList from './src/components/productslist'
import OrdersList from './src/components/orderslist/'

export class App extends Component {

  constructor(props) {
    super(props);
  }

  static navigationOptions = {
    title: 'Products',
    headerStyle: {
      backgroundColor: '#96588a',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  };

  render() {
    return (
      <Container>
        <ProductsList />
      </Container >
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    backgroundColor: '#efefef',
  },
});

const MainNavigator = createBottomTabNavigator({
  Home: App,
  Orders: OrdersList
},
  {
    initialRouteName: 'Home',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === 'Home') {
          iconName = focused? 'md-card': 'md-card';
        } else if (routeName === 'Orders') {
          iconName = focused ? 'md-paper' : 'md-paper';
        }
        return <IconComponent name={iconName} size={25} color={tintColor} />;
      }
    }),
    tabBarOptions: {
      activeTintColor: '#96588a',
      inactiveTintColor: 'gray',
    },
  }
);

const Home = createAppContainer(MainNavigator);
export default Home;

