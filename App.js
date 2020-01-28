import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { Ionicons } from '@expo/vector-icons';
import AuthLoadingScreen from './src/app/account/auth'
import Login from './src/app/account/login'
import Reports from './src/app/report/reports'
import ProductsList from './src/app/product/productslist'
import ProductDetails from './src/app/product/productdetails'
import EditProduct from './src/app/product/editproduct'
import OrdersList from './src/app/order/orderslist'
import OrderDetails from './src/app/order/orderdetails';
import CustomersList from './src/app/customer/customerslist'
import CustomerDetails from './src/app/customer/customerdetails'
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
}, {
  initialRouteName: 'Settings',
  defaultNavigationOptions: {
    headerShown: false,
  }
})

const CustomerNavigator = createStackNavigator({
  Customers: CustomersList,
  CustomerDetails: CustomerDetails,
  Settings: SettingNavigator,
}, {
  initialRouteName: 'Customers',
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: '#96588a',
    },
    headerTintColor: 'white',
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  }
});

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
    headerTintColor: 'white',
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  }
});

const OrderNavigator = createStackNavigator({
  Orders: OrdersList,
  OrderDetails: OrderDetails,
  Settings: SettingNavigator,
}, {
  initialRouteName: 'Orders',
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: '#96588a',
    },
    headerTintColor: 'white',
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  }
});

const reportNavigator = createStackNavigator({
  Reports: Reports,
  Settings: SettingNavigator,
}, {
  initialRouteName: 'Reports',
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: '#96588a',
    },
    headerTintColor: 'white',
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  }
});

const TabNavigator = createBottomTabNavigator({
  Reports: reportNavigator,
  Orders: OrderNavigator,
  Products: ProductNavigator,
  Customers: CustomerNavigator
},
  {
    initialRouteName: 'Reports',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        let IconComponent = Ionicons;
        let iconName;
        if (routeName === 'Reports') {
          iconName ='md-stats';
        } else if (routeName === 'Products') {
          iconName ='md-card';
        } else if (routeName === 'Orders') {
          iconName = 'md-paper';
        }  else if (routeName === 'Customers') {
          iconName = 'md-person';
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