import React, { Component } from 'react';
import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createStackNavigator } from 'react-navigation-stack';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from 'sentry-expo';
import AuthLoadingScreen from './src/app/account/auth'
import Login from './src/app/account/login'
import Reports from './src/app/report/reports'
import ProductsList from './src/app/product/productslist'
import ProductDetails from './src/app/product/productdetails'
import AddProduct from './src/app/product/addproduct'
import EditProduct from './src/app/product/editproduct'
import OrdersList from './src/app/order/orderslist'
import OrderDetails from './src/app/order/orderdetails';
import CustomersList from './src/app/customer/customerslist'
import CustomerDetails from './src/app/customer/customerdetails'
import Settings from './src/app/setting/settings'

const config = require('./config.json');

Sentry.init({
  dsn: 'https://bfd12dd5d0464e70a4402c2562118815@sentry.io/2344328',
  enableInExpoDevelopment: false,
  debug: true
});

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
      backgroundColor: config.colors.headerBackColor,
    },
    headerTintColor: config.colors.headerTextColor,
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  }
});

const ProductNavigator = createStackNavigator({
  ProductsList: ProductsList,
  ProductDetails: ProductDetails,
  AddProduct: AddProduct,
  EditProduct: EditProduct,
  Settings: SettingNavigator,
}, {
  initialRouteName: 'ProductsList',
  defaultNavigationOptions: {
    headerStyle: {
      backgroundColor: config.colors.headerBackColor,
    },
    headerTintColor: config.colors.headerTextColor,
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
      backgroundColor: config.colors.headerBackColor,
    },
    headerTintColor: config.colors.headerTextColor,
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
      backgroundColor: config.colors.headerBackColor,
    },
    headerTintColor: config.colors.headerTextColor,
    headerTitleStyle: {
      fontWeight: 'bold',
    }
  }
});

// Tab Navigation
let TabNavigatorMenu = { Reports: reportNavigator }
if (config.permissions.orders.list) {
  TabNavigatorMenu.Orders = OrderNavigator
}
if (config.permissions.products.list) {
  TabNavigatorMenu.Products = ProductNavigator
}
if (config.permissions.customers.list) {
  TabNavigatorMenu.Customers = CustomerNavigator
}
const TabNavigator = createBottomTabNavigator(TabNavigatorMenu,
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
      activeTintColor: config.colors.tabActiveColor,
      inactiveTintColor: config.colors.tabInactiveColor,
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