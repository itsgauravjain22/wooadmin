import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Clipboard, Image, ScrollView, ActivityIndicator, Modal, ToastAndroid } from 'react-native';
import Moment from 'moment';
import * as SecureStore from 'expo-secure-store';
import GLOBAL from './customerglobal'

const config = require('../../../config.json');

export default class CustomerDetails extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            title: `#${navigation.getParam('customerId', 'Customer Details')}`
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            customerData: null,
            loading: true,
            error: null,
            base_url: null,
            c_key: null,
            c_secret: null,
        };
        GLOBAL.customerdetailsScreen = this;
        customerId = this.props.navigation.getParam('customerId');
    }

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await this.getCredentials();
        this._isMounted && this.props.navigation.addListener('didFocus', () => {
            this.fetchCustomerDetails()
        });
    }

    getCredentials = async () => {
        const credentials = await SecureStore.getItemAsync('credentials');
        const credentialsJson = JSON.parse(credentials)
        this.setState({
            base_url: credentialsJson.base_url,
            c_key: credentialsJson.c_key,
            c_secret: credentialsJson.c_secret,
        })
    }

    fetchCustomerDetails = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/customers/${customerId}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    customerData: responseJson,
                    error: responseJson.code || null,
                    loading: false
                })
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false
                })
            });
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                    <ActivityIndicator color={config.colors.loadingColor} size='large' />
                </View>
            )
        }

        return (
            <ScrollView style={{ flex: 1 }}>
                {this.displayCustomerDataSection()}
                {this.displayShippingDetailsSection()}
                {this.displayBillingDetailsSection()}
            </ScrollView>
        );
    }

    //Display Functions Below

    displayCustomerDataSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>{this.state.customerData.username}</Text>
                <Text>Created at {Moment(this.state.customerData.date_created).format('D/MM/YYYY h:m:s a')}</Text>
                <Text>Name: {this.state.customerData.first_name} {this.state.customerData.last_name}</Text>
                <View style={{flex: -1, flexDirection: 'row'}}>
                    <Text>Email: </Text>
                    <Text selectable dataDetectorType='email'>{this.state.customerData.email}</Text>
                </View >
                <Text>Customer Id: {this.state.customerData.id}</Text>
                <Text>Is Paying: {this.state.customerData.is_paying_customer ? 'Yes' : 'No'}</Text>
            </View >
        )
    }

    displayShippingDetailsSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Shipping Details</Text>
                <TouchableOpacity
                    onPress={() => Clipboard.setString(
                        `${this.state.customerData.shipping.first_name} ${this.state.customerData.shipping.last_name}, ${this.state.customerData.shipping.address_1} ${this.state.customerData.shipping.address_2} ${this.state.customerData.shipping.city} ${this.state.customerData.shipping.postcode} ${this.state.customerData.shipping.state} ${this.state.customerData.shipping.country}`
                    )}>
                    <Text style={{ fontWeight: 'bold' }}>{this.state.customerData.shipping.first_name}
                        {this.state.customerData.shipping.last_name}</Text>
                    <Text>{this.state.customerData.shipping.address_1} {this.state.customerData.shipping.address_2}
                        {this.state.customerData.shipping.city} {this.state.customerData.shipping.postcode}
                        {this.state.customerData.shipping.state} {this.state.customerData.shipping.country}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    displayBillingDetailsSection = () => {
        return (
            <View style={styles.section}>
                <Text style={styles.titleText}>Billing Details</Text>
                <Text style={{ fontWeight: 'bold' }}>{this.state.customerData.billing.first_name}
                    {this.state.customerData.billing.last_name}</Text>
                <Text selectable dataDetectorType='phoneNumber'>Phone: {this.state.customerData.billing.phone}</Text>
                <Text selectable dataDetectorType='email'>Email: {this.state.customerData.billing.email}</Text>
                <TouchableOpacity
                    onPress={() => Clipboard.setString(
                        `${this.state.customerData.billing.first_name} ${this.state.customerData.billing.last_name}, ${this.state.customerData.billing.address_1} ${this.state.customerData.billing.address_2} ${this.state.customerData.billing.city} ${this.state.customerData.billing.postcode} ${this.state.customerData.billing.state} ${this.state.customerData.billing.country}`
                    )}>
                    <Text>Address: {this.state.customerData.billing.address_1} {this.state.customerData.billing.address_2}
                        {this.state.customerData.billing.city} {this.state.customerData.billing.postcode}
                        {this.state.customerData.billing.state} {this.state.customerData.billing.country}</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    section: {
        marginTop: 15,
        marginLeft: 15,
        marginRight: 15
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },
    text: {
        fontSize: 16
    },
});