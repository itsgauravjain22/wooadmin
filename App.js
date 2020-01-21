import React, { Component } from 'react';
import { StatusBar, Platform, StyleSheet, View } from 'react-native';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { Ionicons } from '@expo/vector-icons';
import AuthLoadingScreen from './src/components/account/auth'
import Login from './src/components/account/login'
import ProductsList from './src/components/product/productslist'
import ProductDetails from './src/components/product/productdetails'
import EditProduct from './src/components/product/editproduct'
import OrdersList from './src/components/order/orderslist'
import OrderDetails from './src/components/order/orderdetails';

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
      <View>
        <Text>Hello</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    backgroundColor: '#efefef',
  },
});

const ProductNavigator = createStackNavigator({
  Products: ProductsList,
  ProductDetails: ProductDetails,
  EditProduct: EditProduct,
}, {
  initialRouteName: 'Products',
});

const OrdertNavigator = createStackNavigator({
  Orders: OrdersList,
  OrderDetails: OrderDetails,
}, {
  initialRouteName: 'Orders',
});

const TabNavigator = createBottomTabNavigator({
  Products: ProductNavigator,
  Orders: OrdertNavigator
},
  {
    initialRouteName: 'Products',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === 'Products') {
          iconName = focused ? 'md-card' : 'md-card';
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

const authNavigator = createSwitchNavigator({
  AuthLoading: AuthLoadingScreen,
  Login: Login,
  App: TabNavigator
}, {
  initialRouteName: 'AuthLoading',
}
)

const MainApp = createAppContainer(authNavigator);
export default MainApp;