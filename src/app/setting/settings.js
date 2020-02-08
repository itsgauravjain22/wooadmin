import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const config = require('../../../config.json');

export default class Settings extends Component {
    constructor(props) {
        super(props);
    }

    logout = () => {
        SecureStore.deleteItemAsync('credentials');
        this.props.navigation.dangerouslyGetParent().dangerouslyGetParent().dangerouslyGetParent().navigate('AuthLoading');
    }

    render() {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <TouchableOpacity
                    style={{
                        width: 150,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: config.colors.btnColor
                    }}
                    onPress = {this.logout}
                >
                    <Text style={{
                        color: 'white',
                        fontWeight: 'bold'
                    }}>Logout</Text>
                </TouchableOpacity>
            </View>
        )
    }
}