import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';

const config = require('../../../config.json');

export default class RadioButtons extends Component {

    constructor(props) {
        super(props);
        this.state = {
            options: this.props.options,
            value: `radio_${this.props.value}`,
        };
    }

    render() {
        return (
            <ScrollView>
                {
                    this.state.options.map(([key, value]) => {
                        return (
                            <TouchableOpacity
                                key={key}
                                onPress={() => {
                                    this.setState({
                                        value: `radio_${key}`,
                                    })
                                    this.props.selectedValue(key)
                                }}>
                                <View key={`radio_${key}`} style={styles.buttonContainer}>
                                    <View style={styles.circle}>
                                        {this.state.value === `radio_${key}` && (<View style={styles.checkedCircle} />)}
                                    </View>
                                    <Text style={{ paddingLeft: 20, }}>
                                        {value}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )
                    })
                }
            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 10,
        paddingBottom: 10
    },
    circle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ACACAC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkedCircle: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: config.colors.radioCheckedColor,
    }
});