import React, { Component } from 'react';
import {
    StyleSheet, Text, View, TouchableOpacity, Clipboard, Image,
    ScrollView, ActivityIndicator, Modal, ToastAndroid, Alert, Switch, TextInput
} from 'react-native';
import Moment from 'moment';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import RadioButtons from '../commoncomponents/radiobuttons'
import GLOBAL from './orderglobal'

const config = require('../../../config.json');

export default class OrderDetails extends Component {
    constructor(props) {
        super(props);
        this.state = {
            base_url: null,
            c_key: null,
            c_secret: null,
            isOrderDataReady: false,
            orderData: null,
            isOrderNotesDataReady: false,
            orderNotesData: [],
            addOrderNoteModalShown: false,
            newOrderNote: "",
            customerNote: false,
            loading: true,
            imageLoading: false,
            error: null,
            orderStatusOptions: null,
            orderStatusValue: null,
            orderStatusModalShown: false
        };
        GLOBAL.orderdetailsScreen = this;
        orderId = this.props.navigation.getParam('orderId');
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: `#${navigation.getParam('orderId', 'Order Details')}`
        };
    };

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await this.getCredentials();
        this._isMounted && this.fetchOrderDetails()
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={{ flex: 1, justifyContent: "center", alignContent: "center", padding: 20 }}>
                    <ActivityIndicator color={config.colors.loadingColor} size='large' />
                </View>
            )
        } else {
            return (
                <ScrollView style={{ flex: 1 }}>
                    {this.displayOrderDataSection()}
                    {this.displayProductSection()}
                    {this.displayPaymentSection()}
                    {this.displayShippingDetailsSection()}
                    {this.displayBillingDetailsSection()}
                    {this.displayOrderNotesSection()}
                </ScrollView>
            );
        }
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

    //Fetch Function Below

    fetchOrderDetails = () => {
        const { base_url, c_key, c_secret } = this.state
        const url = `${base_url}/wp-json/wc/v3/orders/${orderId}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                if ('code' in responseJson) {
                    this.setState({
                        isOrderDataReady: false,
                        error: responseJson.code,
                        loading: false
                    })
                    ToastAndroid.show(`Can't fetch order details. Error: ${responseJson.code}`, ToastAndroid.LONG);
                } else {
                    this.setState({
                        isOrderDataReady: true,
                        orderData: responseJson,
                    }, this.fetchOrderNotes)
                }
            }).catch((error) => {
                this.setState({
                    error,
                    loading: false
                })
                ToastAndroid.show(`Can't fetch order details. Error: ${error}`, ToastAndroid.LONG);
            })
    }

    fetchOrderNotes = () => {
        const { base_url, c_key, c_secret } = this.state
        const url = `${base_url}/wp-json/wc/v3/orders/${orderId}/notes?consumer_key=${c_key}&consumer_secret=${c_secret}`
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                if ('code' in responseJson) {
                    this.setState({
                        isOrderNotesDataReady: false,
                        error: responseJson.code,
                    })
                    ToastAndroid.show(`Can't fetch order notes. Error: ${responseJson.code}`, ToastAndroid.LONG);
                } else {
                    this.setState({
                        isOrderNotesDataReady: true,
                        orderNotesData: responseJson,
                    }, this.fetchOrderStatus)
                }
            }).catch((error) => {
                this.setState({
                    error
                })
                ToastAndroid.show(`Can't fetch order notes. Error: ${error}`, ToastAndroid.LONG);
            })
    }

    fetchOrderStatus = () => {
        const { base_url, c_key, c_secret } = this.state
        const orderStatusesUrl = `${base_url}/wp-json/wc/v3/reports/orders/totals?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true })
        fetch(orderStatusesUrl).then(response => response.json())
            .then(responseJson => {
                if ('code' in responseJson) {
                    this.setState({
                        error: responseJson.code
                    })
                    ToastAndroid.show(`Can't fetch other order statuses. Error: ${responseJson.message}`, ToastAndroid.LONG);
                } else {
                    let orderStatusMap = new Map();
                    if (Array.isArray(responseJson) && responseJson.length > 0) {
                        if ('slug' in responseJson[0] && 'name' in responseJson[0]) {
                            responseJson.forEach(item => {
                                orderStatusMap.set(item.slug, item.name)
                            })
                        }
                    }
                    this.setState({
                        orderStatusOptions: [...orderStatusMap],
                        orderStatusValue: this.state.orderData.status,
                        loading: false,
                    }, this.fetchOrderProductImages)
                }
            })
    }

    fetchOrderProductImages = () => {
        this.state.orderData.line_items.forEach((item, index) => {
            this.fetchProductPrimaryImage(item.product_id, index)
        })
    }

    fetchProductPrimaryImage = (productId, index) => {
        const { base_url, c_key, c_secret } = this.state
        this.setState({ imageLoading: true });
        const url = `${base_url}/wp-json/wc/v3/products/${productId}?consumer_key=${c_key}&consumer_secret=${c_secret}`
        fetch(url)
            .then((response) => response.json())
            .then(responseJson => {
                if ('images' in responseJson && Array.isArray(responseJson.images) && responseJson.images.length) {
                    if ('line_items' in this.state.orderData && Array.isArray(this.state.orderData.line_items) && this.state.orderData.line_items.length) {
                        let modifiedOrderData = this.state.orderData
                        modifiedOrderData.line_items[index].primary_image_src = responseJson.images[0].src
                        this.setState({
                            orderData: modifiedOrderData,
                            imageLoading: false,
                            error: responseJson.code || null,
                        })
                    }
                } else {
                    this.setState({
                        imageLoading: false,
                        error: responseJson.code || null,
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    error,
                    imageLoading: false,
                })
            });
    }

    getLineItems = () => {
        if (this.state.isOrderDataReady) {
            let itemArray = [];
            this.state.orderData.line_items.forEach(item => {
                itemArray.push(
                    <View key={item.id} style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                            <Image source={'primary_image_src' in item ? { uri: item.primary_image_src } : null}
                                style={{ height: 100, width: 100 }} resizeMode='contain' />
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
                )
            })
            return itemArray;
        } else return null
    }

    getProductTotal = () => {
        if (this.state.isOrderDataReady) {
            let productTotal = 0;
            this.state.orderData.line_items.forEach(item => {
                productTotal += parseFloat(item.total);
            });
            return productTotal.toFixed(2);
        } else return null
    }

    getCurrencySymbol = () => {
        if (this.state.isOrderDataReady) {
            return (this.state.orderData.currency_symbol)
                ? this.state.orderData.currency_symbol
                : this.state.orderData.currency;
        } else return null
    }

    //Get optionally TM Product Options Fees Total
    getTMProductOptionsFees = () => {
        let tmProductOptionsFees = [];
        if ('fee_lines' in this.state.orderData && Array.isArray(this.state.orderData.fee_lines)
            && this.state.orderData.fee_lines.length > 0) {
            this.state.orderData.fee_lines.forEach(item => {
                if ('id' in item && 'name' in item && 'total' in item)
                    tmProductOptionsFees.push(
                        <Text key={`fee_lines_${item.id}`}>{item.name}: {item.total}</Text>
                    )
            })
        }
        return (
            <View>
                {tmProductOptionsFees}
            </View>
        )
    }

    //Get optionally TM Product Options
    getTMProductOptions(meta_dataArray) {
        let tmProductOptions = [];
        let tmProductOptionsMap = new Map();
        meta_dataArray.forEach(item => {
            if (item && (item.key === '_tmcartepo_data')) {
                item.value.forEach(tmObject => {
                    let value = `${tmObject.name}_${tmObject.value}_${item.id}`;
                    tmProductOptionsMap.set(tmObject.name, value);
                })
            }
        });
        tmProductOptionsMap.forEach((value, key) => {
            tmProductOptions.push(<Text key={value}>{key}: {(value) ? value.toString().split('_')[1] : null}</Text>)
        });
        return tmProductOptions;
    }

    //Update Functions Below

    updateOrderStatus = () => {
        const { base_url, c_key, c_secret } = this.state
        const url = `${base_url}/wp-json/wc/v3/orders/${orderId}?consumer_key=${c_key}&consumer_secret=${c_secret}`;
        fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "status": this.state.orderStatusValue
            })
        }).then((response) => response.json())
            .then(responseJson => {
                if ('code' in responseJson)
                    ToastAndroid.show(`Order Not Updated. Error: ${responseJson.message}`, ToastAndroid.LONG);
                else if ('status' in responseJson) {
                    this.setState({
                        orderStatusValue: responseJson.status
                    })
                    ToastAndroid.show(`Order status updated to ${responseJson.status}`, ToastAndroid.LONG)
                }
                else {
                    ToastAndroid.show(`Order Not Updated`, ToastAndroid.LONG)
                }
                this.fetchOrderDetails()
                GLOBAL.orderslistScreen.handleRefresh()
            }).catch((error) => {
                ToastAndroid.show('Order Not Updated. Error: ' + error, ToastAndroid.LONG)
                this.fetchOrderDetails()
            });
    }

    //Add Funtion Below
    addOrderNote = () => {
        const { base_url, c_key, c_secret } = this.state
        const url = `${base_url}/wp-json/wc/v3/orders/${orderId}/notes/?force=true&consumer_key=${c_key}&consumer_secret=${c_secret}`;
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "customer_note": this.state.customerNote,
                "note": this.state.newOrderNote
            })
        }).then((response) => response.json())
            .then(responseJson => {
                if ('code' in responseJson) {
                    ToastAndroid.show(`Unable to add order note. Error: ${responseJson.code}`, ToastAndroid.LONG);
                } else if ('id' in responseJson) {
                    ToastAndroid.show(`Order note added successfully`, ToastAndroid.LONG)
                    this.fetchOrderDetails()
                }
            }).catch((error) => {
                ToastAndroid.show('Unable to delete order note. Error: ' + error, ToastAndroid.LONG)
            })
    }

    //Delete Function Below

    deleteOrderNote = (orderNoteId) => e => {
        const { base_url, c_key, c_secret } = this.state
        const url = `${base_url}/wp-json/wc/v3/orders/${orderId}/notes/${orderNoteId}?force=true&consumer_key=${c_key}&consumer_secret=${c_secret}`;
        fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then((response) => response.json())
            .then(responseJson => {
                if ('code' in responseJson) {
                    ToastAndroid.show(`Unable to delete order note. Error: ${responseJson.code}`, ToastAndroid.LONG);
                } else if ('id' in responseJson) {
                    ToastAndroid.show(`Order note deleted`, ToastAndroid.LONG)
                    this.fetchOrderDetails()
                }
            }).catch((error) => {
                ToastAndroid.show('Unable to delete order note. Error: ' + error, ToastAndroid.LONG)
            })
    }

    //Display Functions Below

    displayOrderStatusModal = () => {
        return (
            <Modal
                transparent={true}
                visible={this.state.orderStatusModalShown}>
                <View
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: 20,
                    }}
                >
                    <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <View style={{
                            flex: -1,
                            width: 300,
                            flexDirection: 'column',
                            backgroundColor: 'white'
                        }}>
                            <Text style={styles.modalTitleText}>Change Order Status</Text>
                            <RadioButtons
                                options={this.state.orderStatusOptions}
                                value={this.state.orderData.status}
                                selectedValue={(selectedValue) => {
                                    this.setState({
                                        orderStatusValue: selectedValue
                                    })
                                }}
                            />
                            <View style={{
                                flex: 0,
                                flexDirection: 'row-reverse',
                                backgroundColor: 'white'
                            }}>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.updateOrderStatus()
                                            this.setState({
                                                orderStatusModalShown: !this.state.orderStatusModalShown
                                            })
                                        }}>
                                        <Text style={styles.modalControlText}>Apply</Text>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => this.setState({
                                            orderStatusModalShown: !this.state.orderStatusModalShown
                                        })}>
                                        <Text style={styles.modalControlText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal >
        )
    }

    displayOrderDataSection = () => {
        if (this.state.isOrderDataReady) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Order #{this.state.orderData.number}</Text>
                    <Text>Created at {Moment(this.state.orderData.date_created).format('D/MM/YYYY h:m:s a')}</Text>
                    <View style={{ flex: 1, flexDirection: 'row' }}>
                        <View style={{ width: '90%' }}>
                            <Text>Order Status: {this.state.orderData.status}</Text>
                        </View>
                        <View style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
                            {config.permissions.orders.edit
                                ? <TouchableOpacity
                                    onPress={() => this.setState({
                                        orderStatusModalShown: !this.state.orderStatusModalShown
                                    })}
                                >
                                    <Ionicons name="md-create" size={25} color={config.colors.btnColor} />
                                </TouchableOpacity>
                                : null
                            }
                        </View>
                        {this.displayOrderStatusModal()}
                    </View>
                </View>
            )
        } else return null
    }

    displayProductSection = () => {
        if (this.state.isOrderDataReady) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Product</Text>
                    {this.getLineItems()}
                </View>
            )
        } else return null
    }

    displayPaymentSection = () => {
        if (this.state.isOrderDataReady) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Payment</Text>
                    <Text>Payment Gateway: {this.state.orderData.payment_method_title}</Text>
                    <Text style={{ fontWeight: 'bold' }}>Order Total: {this.getCurrencySymbol()}{this.state.orderData.total}</Text>
                    <Text>Product Total: {this.getCurrencySymbol()}{this.getProductTotal()}</Text>
                    <Text>Shipping: {this.getCurrencySymbol()}{this.state.orderData.shipping_total}</Text>
                    <Text>Taxes: {this.getCurrencySymbol()}{this.state.orderData.total_tax}</Text>
                    {this.getTMProductOptionsFees()}
                </View>
            )
        } else return null
    }

    displayShippingDetailsSection = () => {
        if (this.state.isOrderDataReady) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Shipping Details</Text>
                    <TouchableOpacity
                        onLongPress={() => {
                            Clipboard.setString(
                                `${this.state.orderData.shipping.first_name} ${this.state.orderData.shipping.last_name},\n${this.state.orderData.shipping.address_1} ${this.state.orderData.shipping.address_2} ${this.state.orderData.shipping.city} ${this.state.orderData.shipping.state} ${this.state.orderData.shipping.postcode} ${this.state.orderData.shipping.country}`
                            )
                            ToastAndroid.show('Shipping details copied', ToastAndroid.LONG)
                        }}>
                        <Text style={{ fontWeight: 'bold' }}>{this.state.orderData.shipping.first_name} {this.state.orderData.shipping.last_name}</Text>
                        <Text>{`${this.state.orderData.shipping.address_1} ${this.state.orderData.shipping.address_2} ${this.state.orderData.shipping.city} ${this.state.orderData.shipping.state} ${this.state.orderData.shipping.postcode} ${this.state.orderData.shipping.country}`}</Text>
                    </TouchableOpacity>
                </View>
            )
        } else return null
    }

    displayBillingDetailsSection = () => {
        if (this.state.isOrderDataReady) {
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Billing Details</Text>
                    <Text style={{ fontWeight: 'bold' }}>{`${this.state.orderData.billing.first_name} ${this.state.orderData.billing.last_name}`}</Text>
                    <Text selectable dataDetectorType='phoneNumber'>Phone: {this.state.orderData.billing.phone}</Text>
                    <Text selectable dataDetectorType='email'>Email: {this.state.orderData.billing.email}</Text>
                    <TouchableOpacity
                        onLongPress={() => {
                            Clipboard.setString(
                                `${this.state.orderData.billing.first_name} ${this.state.orderData.billing.last_name},\n${this.state.orderData.billing.address_1} ${this.state.orderData.billing.address_2} ${this.state.orderData.billing.city} ${this.state.orderData.billing.state} ${this.state.orderData.billing.postcode} ${this.state.orderData.billing.country}`
                            )
                            ToastAndroid.show('Billing details copied', ToastAndroid.LONG)
                        }}>
                        <Text>Address: {`${this.state.orderData.billing.address_1} ${this.state.orderData.billing.address_2} ${this.state.orderData.billing.city} ${this.state.orderData.billing.state} ${this.state.orderData.billing.postcode} ${this.state.orderData.billing.country}`}</Text>
                    </TouchableOpacity>
                </View>
            )
        } else return null
    }

    displayAddOrderNoteModal = () => {
        return (
            <Modal
                transparent={true}
                visible={this.state.addOrderNoteModalShown}>
                <View
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: 20,
                    }}
                >
                    <View style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <View style={{
                            flex: -1,
                            width: 300,
                            backgroundColor: 'white'
                        }}>
                            <Text style={styles.modalTitleText}>Add Order Note</Text>
                            <View style={{
                                flex: -1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingLeft: 10,
                                paddingRight: 10
                            }}>
                                <View style={{
                                    flex: -1,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    alignItems: 'center'
                                }}>
                                    <Text>Customer Note? : </Text>
                                </View>
                                <View style={{
                                    flex: -1,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Switch
                                        thumbColor={config.colors.switchThumbColor}
                                        trackColor={{ true: config.colors.switchTrackColor }}
                                        value={this.state.customerNote}
                                        onValueChange={(value) => {
                                            this.setState({ customerNote: value })
                                        }}
                                    />
                                </View>
                            </View>
                            <TextInput
                                style={{
                                    borderWidth: 1,
                                    borderColor: 'black',
                                    margin: 10,
                                    padding: 10,
                                }}
                                multiline
                                numberOfLines={4}
                                placeholder='Add order note here...'
                                textAlignVertical='top'
                                onChangeText={value => {
                                    this.setState({
                                        newOrderNote: value
                                    })
                                }}
                                value={this.state.newOrderNote}
                            />
                            <View style={{
                                flex: 0,
                                flexDirection: 'row-reverse',
                                backgroundColor: 'white'
                            }}>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            this.addOrderNote()
                                            this.setState({
                                                addOrderNoteModalShown: !this.state.addOrderNoteModalShown
                                            })
                                        }}>
                                        <Text style={styles.modalControlText}>Add</Text>
                                    </TouchableOpacity>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        onPress={() => this.setState({
                                            addOrderNoteModalShown: !this.state.addOrderNoteModalShown
                                        })}>
                                        <Text style={styles.modalControlText}>Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View >
                </View>
            </Modal >
        )
    }

    displayOrderNotesSection = () => {
        if (this.state.isOrderNotesDataReady) {
            const orderNotesArray = []
            this.state.orderNotesData.forEach(item => {
                orderNotesArray.push(
                    <View key={`order_note_${item.id}_view_1`}
                        style={item.customer_note ? styles.orderCustomerNoteBox :
                            styles.orderPrivateNoteBox}>
                        <View key={`order_note_${item.id}_touch_1a`}
                            style={[{ padding: 5 },
                            config.permissions.orders.edit
                                ? { width: '90%' }
                                : { width: '100%' }
                            ]}
                        >
                            <Text
                                key={`order_note_${item.id}_note`}
                                dataDetectorType='all'
                                selectable={true}
                            >
                                {item.note}
                            </Text>
                            <Text
                                key={`order_note_${item.id}_date_created`}
                                style={{ fontSize: 10 }}
                            >
                                Note added at {Moment(item.date_created).format('D/MM/YYYY h:m:s a')} by {item.author}
                            </Text>
                        </View>
                        {config.permissions.orders.edit
                            ? <View key={`order_note_${item.id}_view_1b`}
                                style={{ width: '10%', justifyContent: 'center', alignItems: 'center' }}>
                                <TouchableOpacity
                                    key={item.id}
                                    style={{ padding: 10 }}
                                    onPress={() => {
                                        Alert.alert(
                                            'Delete Order Note',
                                            'Do you really want to delete this order note?',
                                            [
                                                {
                                                    text: 'No'
                                                },
                                                {
                                                    text: 'Yes',
                                                    onPress: this.deleteOrderNote(item.id)
                                                },
                                            ],
                                            { cancelable: true },
                                        )
                                    }}
                                >
                                    <Ionicons name="md-trash" size={23} color='red' />
                                </TouchableOpacity>
                            </View>
                            : null}
                    </View>
                )
            })
            return (
                <View style={styles.section}>
                    <Text style={styles.titleText}>Order Notes</Text>
                    {config.permissions.orders.edit
                        ? <TouchableOpacity
                            style={styles.addOrderNoteBtn}
                            onPress={() => {
                                this.setState({
                                    addOrderNoteModalShown: true
                                })
                            }}
                        >
                            <Text style={styles.addOrderNoteBtnText}>Add Order Note</Text>
                        </TouchableOpacity>
                        : null}
                    {orderNotesArray}
                    {this.displayAddOrderNoteModal()}
                </View>
            )
        } else return null
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
    modalTitleText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
        marginTop: 10,
        marginBottom: 10
    },
    modalControlText: {
        color: config.colors.btnColor,
        fontWeight: 'bold',
        marginRight: 15,
        marginBottom: 15
    },
    addOrderNoteBtn: {
        backgroundColor: config.colors.btnColor,
        height: 40,
        padding: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    addOrderNoteBtnText: {
        color: config.colors.btnTextColor,
        fontWeight: 'bold'
    },
    orderCustomerNoteBox: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: config.colors.orderNotes.customerNoteBoxColor,
        padding: 5,
        marginTop: 10,
    },
    orderPrivateNoteBox: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: config.colors.orderNotes.privateNoteBoxColor,
        padding: 5,
        marginTop: 10,
    }
});