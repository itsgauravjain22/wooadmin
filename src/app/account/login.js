import React, { Component } from 'react';
import {
    StyleSheet, TextInput, TouchableOpacity, Text, ToastAndroid, ActivityIndicator,
    Image, View, KeyboardAvoidingView, ScrollView
} from 'react-native';
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

    submitButton = async () => {
        if (this.state.loading) return;

        this.setState({
            loading: true,
        });

        let authenticated = await this.checkAuthentication();
        if (authenticated) {
            this.setState({
                loading: false
            }, () => this.props.navigation.navigate('App')
            );
        } else {
            this.setState({ loading: false });
        }
    }

    render() {
        return (
            <KeyboardAvoidingView behavior="padding" style={styles.container} enabled>
                <ScrollView>
                    <View style={styles.innerContainer}>
                        <View style={styles.inputWrapper}>
                            <View style={{
                                justifyContent: 'center',
                                alignItems: 'center',
                                margin: 15
                            }}>
                                <Image
                                    source={require('../../../assets/images/logo.png')}
                                    style={{
                                        height: 150,
                                        width: 150,
                                    }}
                                />
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="Woocommerce site url (with https)"
                                autoCorrect={false}
                                autoCapitalize={'none'}
                                returnKeyType={'next'}
                                placeholderTextColor='#96588a'
                                underlineColorAndroid="transparent"
                                onChangeText={(base_url) => this.setState({ 'base_url': base_url })}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Consumer Key"
                                autoCorrect={false}
                                autoCapitalize={'none'}
                                returnKeyType={'next'}
                                placeholderTextColor='#96588a'
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
                                placeholderTextColor='#96588a'
                                underlineColorAndroid="transparent"
                                onChangeText={(value) => this.setState({ 'c_secret': value })}
                            />
                            <View style={styles.showPassword}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={{ paddingRight: 10, paddingTop: 10, paddingBottom: 15 }}
                                    onPress={this.showPass}>
                                    <Text style={{ color: '#96588a' }}>Show Secret</Text>
                                </TouchableOpacity>
                            </View>
                            <View>
                                {this.state.loading ? (
                                    <ActivityIndicator size="large" color='#96588a' />
                                ) : (
                                        <TouchableOpacity style={styles.loginBtn} onPress={this.submitButton}>
                                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                                Login
                                        </Text>
                                        </TouchableOpacity>
                                    )}

                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView >
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white'
    },
    innerContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputWrapper: {
        marginTop: 80,
        marginBottom: 50,
        width: '80%'
    },
    input: {
        backgroundColor: 'white',
        width: '100%',
        height: 50,
        marginTop: 10,
        color: '#96588a',
        borderBottomColor: '#96588a',
        borderBottomWidth: 1,
    },
    showPassword: {
        width: '100%',
        marginTop: 5,
        alignItems: 'flex-end'
    },
    loginBtn: {
        backgroundColor: '#96588a',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
        height: 50,
    }
});
