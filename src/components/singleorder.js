import React, { Fragment, Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ScrollView, ActivityIndicator } from 'react-native';
import Moment from 'moment';
import Base64 from '../utility/base64';

export default class SingleOrder extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
        };
        orderData = this.props.navigation.getParam('orderData');
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: `#${navigation.getParam('orderId', 'Order Details')}`,
            headerStyle: {
                backgroundColor: '#96588a',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        };
    };

    getProductImage(productId) {
        let productDataJson;
        this.setState({ loading: true });
        productDataJson = fetch(`https://www.kalashcards.com/wp-json/wc/v3/products/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + Base64.btoa('ck_20d0fd1bf4b32534250b69076ca57ac75cf51662:cs_76e01499543ded3f5ecd82d9e762d4fa1680c862'),
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                this.setState({
                    loading: false,
                    error: responseJson.error || null,
                });
                return responseJson;
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false,
                })
            });
        console.log(productDataJson);
        return (Array.isArray(productDataJson.images) && productDataJson.images.length) ?
            productDataJson.images[0].src :
            '../../assets/images/blank_product.png';
    }

    getProductTotal = () => {
        let productTotal = 0;
        orderData.line_items.forEach(item => {
            productTotal += parseFloat(item.total);
        });
        return productTotal.toFixed(2);
    }

    getCurrencySymbol = () => {
        return (orderData.currency_symbol) ? orderData.currency_symbol : orderData.currency;
    }

    //Get optionally TM Product Options
    getTMProductOptions(meta_dataArray) {
        let tmProductOptions = [];
        let tmProductOptionsMap = new Map();
        meta_dataArray.forEach(item => {
            if (item && (item.key === '_tmcartepo_data')) {
                item.value.forEach(tmObject => {
                    tmProductOptionsMap.set(tmObject.name, tmObject.value);
                })
            }
        });
        tmProductOptionsMap.forEach((value, key) => {
            tmProductOptions.push(<Text>{key}: {value}</Text>)
        });
        return tmProductOptions;
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                    <ActivityIndicator color='#96588a' size='large' />
                </View>
            )
        }

        return (
            <ScrollView style={{ flex: 1 }}>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Order #{orderData.number}</Text>
                    <Text>Created {Moment().calendar(orderData.date_created)}</Text>
                    <Text>Order Status: {orderData.status}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Product</Text>
                    <FlatList
                        data={orderData.line_items}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={this.renderListSeparator}
                        renderItem={({ item }) =>
                            <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                                <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
                                    <Image source={null}
                                        onError={(e) => { this.props.source = require('../../assets/images/blank_product.png') }}
                                        style={{ height: 115, width: 115 }} resizeMode='contain' />
                                </View>
                                <View style={{ flex: 2, marginTop: 10, marginBottom: 10, justifyContent: "center" }}>
                                    <View style={{ marginLeft: 10 }}>
                                        <Text>{item.name}</Text>
                                        <Text>SKU: {item.sku}</Text>
                                        <Text>Price: {this.getCurrencySymbol()}{item.price.toFixed(2)}</Text>
                                        <Text>Oty: {item.quantity}</Text>
                                        <View>{this.getTMProductOptions(item.meta_data)}</View>
                                    </View>
                                </View>
                            </View>
                        }
                    />
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Payment</Text>
                    <Text style={{ fontWeight: 'bold' }}>Order Total: {this.getCurrencySymbol()}{orderData.total}</Text>
                    <Text>Product Total: {this.getCurrencySymbol()}{this.getProductTotal()}</Text>
                    <Text>Shipping:{this.getCurrencySymbol()}{orderData.shipping_total}</Text>
                    <Text>Taxes: {this.getCurrencySymbol()}{orderData.total_tax}</Text>
                    <Text>Payment Gateway: {orderData.payment_method_title}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Shipping Details</Text>
                    <Text style={{ fontWeight: 'bold' }}>{orderData.shipping.first_name} {orderData.shipping.last_name}</Text>
                    <Text>{orderData.shipping.address_1} {orderData.shipping.address_2} {orderData.shipping.city} {orderData.shipping.postcode} {orderData.shipping.state} {orderData.shipping.country}</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.titleText}>Billing Details</Text>
                    <Text style={{ fontWeight: 'bold' }}>{orderData.billing.first_name} {orderData.billing.last_name}</Text>
                    <Text>Phone: {orderData.billing.phone}</Text>
                    <Text>Email: {orderData.billing.email}</Text>
                    <Text>Address: {orderData.billing.address_1} {orderData.billing.address_2}{orderData.billing.city} {orderData.billing.postcode} {orderData.billing.state} {orderData.billing.country}</Text>
                </View>
            </ScrollView>
        );
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