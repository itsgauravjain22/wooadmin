import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { Ionicons } from '@expo/vector-icons';
import AuthLoadingScreen from './src/app/account/auth'
import Login from './src/app/account/login'
import ProductsList from './src/app/product/productslist'
import ProductDetails from './src/app/product/productdetails'
import EditProduct from './src/app/product/editproduct'
import OrdersList from './src/app/order/orderslist'
import OrderDetails from './src/app/order/orderdetails';
import Settings from './src/app/setting/settings'

export default class App extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <MainApp />
    );
  }
}

const SettingNavigator = createStackNavigator({
  Settings: Settings,
},{
  initialRouteName: 'Settings',
  defaultNavigationOptions: {
    headerShown: false,
  }
})

const ProductNavigator = createStackNavigator({
  Products: ProductsList,
  ProductDetails: ProductDetails,
  EditProduct: EditProduct,
  Settings: SettingNavigator,
}, {
  initialRouteName: 'Products',
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: '#96588a',
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  }
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