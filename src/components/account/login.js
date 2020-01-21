import React, { Component } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Text, ToastAndroid, ActivityIndicator, View, KeyboardAvoidingView } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default class Login extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerShown: false
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            showPass: true,
            press: false,
            loading: false,
            base_url: null,
            c_key: null,
            c_secret: null,
        };
        this.showPass = this.showPass.bind(this);
        this.submitButton = this.submitButton.bind(this);
    }

    showPass() {
        this.state.press === false
            ? this.setState({ showPass: false, press: true })
            : this.setState({ showPass: true, press: false });
    }

    checkAuthentication = async () => {
        let url = `${this.state.base_url}/wp-json/wc/v3/system_status?consumer_key=${this.state.c_key}&consumer_secret=${this.state.c_secret}`;

        try {
            let response = await fetch(url);
            if (response.ok) {
                let credentials = {
                    'base_url': this.state.base_url,
                    'c_key': this.state.c_key,
                    'c_secret': this.state.c_secret,
                }
                await SecureStore.setItemAsync('credentials', JSON.stringify(credentials));
                ToastAndroid.show('Authenticated...', ToastAndroid.LONG);
                return true;
            } else if (response.status >= 400 && response.status <= 500) {
                let responseStatus = response.status;
                let responseData = await response.json();
                ToastAndroid.show(`Error: ${responseStatus} - ${responseData.message}`, ToastAndroid.LONG);
                return false;
            }
        } catch (error) {
            ToastAndroid.show('Error Resolving Url - ' + error, ToastAndroid.LONG);
            return false;
        }
    }

    submitButton = async() => {
        if (this.state.loading) return;

        this.setState({
            loading: true,
        });

        let authenticated = await this.checkAuthentication();
        if (authenticated) {
            this.props.navigation.navigate('App');
            this.setState({ loading: false });
        } else {
            this.setState({ loading: false });
        }
    }

    render() {
        return (
            <KeyboardAvoidingView behavior="padding" style={styles.container}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Website Url (including https)"
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        returnKeyType={'next'}
                        placeholderTextColor="white"
                        underlineColorAndroid="transparent"
                        onChangeText={(base_url) => this.setState({ 'base_url': base_url })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Consumer Key"
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        returnKeyType={'next'}
                        placeholderTextColor="white"
                        underlineColorAndroid="transparent"
                        onChangeText={(c_key) => this.setState({ 'c_key': c_key })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Consumer Secret"
                        secureTextEntry={this.state.showPass}
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        returnKeyType={'done'}
                        placeholderTextColor="white"
                        underlineColorAndroid="transparent"
                        onChangeText={(value) => this.setState({ 'c_secret': value })}
                    />
                    <View style={styles.showPassword}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={{ marginRight: 10 }}
                            onPress={this.showPass}>
                            <Text style={{ color: 'white' }}>Show Secret</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        {this.state.loading ? (
                            <ActivityIndicator size="large" color='white' />
                        ) : (
                                <TouchableOpacity style={styles.loginBtn} onPress={this.submitButton}>
                                    <Text style={{ color: '#96588a', fontWeight: 'bold', fontSize: 16 }}>
                                        Login
                                        </Text>
                                </TouchableOpacity>
                            )}

                    </View>
                </View>
            </KeyboardAvoidingView >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#96588a'
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
        width: '100%',
        height: 40,
        marginTop: 15,
        paddingLeft: 45,
        borderRadius: 20,
        color: '#ffffff',
    },
    inputWrapper: {
        width: '80%',
    },
    showPassword: {
        width: '100%',
        marginTop: 10,
        alignItems: 'flex-end'
    },
    loginBtn: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        height: 40,
        borderRadius: 20,
    }
});
