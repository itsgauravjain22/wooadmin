import React, { Component } from 'react';
import { View, ActivityIndicator } from 'react-native';
import {
    Header, Left, Body, Right, Title
} from 'native-base';
import * as Font from 'expo-font';

export default class AppHeader extends Component {
    constructor(props) {
        super(props);
        this.state = { loading: true };
    }

    async componentDidMount() {
        await Font.loadAsync({
            'Roboto': require("native-base/Fonts/Roboto.ttf"),
            'Roboto_medium': require("native-base/Fonts/Roboto_medium.ttf"),
        });
        this.setState({ loading: false });
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, padding: 20 }}>
                    <ActivityIndicator />
                </View>
            )
        }

        return (
            <Header>
                <Left>
                </Left>
                <Body>
                    <Title>{this.props.title}</Title>
                </Body>
                <Right />
            </Header>
        );
    }
}