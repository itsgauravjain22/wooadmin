import React, { Component } from 'react';
import { ActivityIndicator, View} from 'react-native';
import * as SecureStore from 'expo-secure-store';

const config = require('../../../config.json');

export default class AuthLoadingScreen extends Component {
    componentDidMount() {
        // this.x();
        this._bootstrapAsync();
    }

    x = async () => await SecureStore.deleteItemAsync('credentials');

    _bootstrapAsync = async () => {
        const previousCredentials = await SecureStore.getItemAsync('credentials');
        this.props.navigation.navigate(previousCredentials ? 'App' : 'Login');
    }

    render() {
        return (
            <View style={{flex:1, justifyContent: 'center', alignContent: 'center'}}>
                <ActivityIndicator  size='large' color={config.colors.loadingColor}/>
            </View>
        )
    }
}