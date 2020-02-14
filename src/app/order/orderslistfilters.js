import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSelect from 'react-native-multiple-select';
import * as SecureStore from 'expo-secure-store';

const config = require('../../../config.json');

export default class OrdersListFilters extends Component {
    constructor(props) {
        super(props);
        this.state = {
            base_url: null,
            c_key: null,
            c_secret: null,
            filterModalShown: false,
            areOrderStatusesReady: false,
            orderStatusOptions: [],
            selectedOrderStatuses: [],
        }
        GLOBAL.orderslistScreen = this
        this._isMounted = false;
    }

    async componentDidMount() {
        this._isMounted = true
        this._isMounted && await this.getCredentials()
        this._isMounted && this.fetchOrderStatus()
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <View>
                {this.displayFilterButton()}
                {this.displayFilterModal()}
            </View>
        )
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

    //Fetch Functions Below

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
                    if (Array.isArray(responseJson) && responseJson.length > 0) {
                        if ('slug' in responseJson[0] && 'name' in responseJson[0]) {
                            this.setState({
                                orderStatusOptions: responseJson,
                                areOrderStatusesReady: true,
                            })
                        }
                    }
                }
            })
    }

    //Display Functions Below

    displayFilterButton = () => {
        return (
            <TouchableOpacity
                onPress={() => {
                    this.setState({
                        filterModalShown: true
                    })
                }}
                style={styles.filterBtn}
            >
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <Ionicons name='md-funnel' height size={20} color={config.colors.iconLightColor} />
                    <Text style={styles.filterBtnText}>Filter</Text>
                </View>
            </TouchableOpacity>
        )
    }

    displayFilterModal = () => {
        return (
            <Modal
                transparent={false}
                visible={this.state.filterModalShown}
            >
                <View style={{ flex: 1 }}>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Filter By</Text>
                        <Text style={styles.h2Text}>Order Status</Text>
                        {this.state.areOrderStatusesReady
                            ? <MultiSelect
                                items={this.state.orderStatusOptions}
                                uniqueKey="slug"
                                displayKey="name"
                                onSelectedItemsChange={selectedItems => this.setState({
                                    selectedOrderStatuses: selectedItems
                                })}
                                fixedHeight={false}
                                ref={(component) => { this.multiSelect = component }}
                                selectedItems={this.state.selectedOrderStatuses}
                                selectText="Select Order Status"
                                searchInputPlaceholderText="Search Status..."
                                searchInputStyle={{ height: 40, color: 'black' }}
                                styleMainWrapper={{marginTop: 10}}
                                itemTextColor='black'
                                selectedItemTextColor={config.colors.multiSelectSelectedColor}
                                selectedItemIconColor={config.colors.multiSelectSelectedColor}
                                tagBorderColor={config.colors.multiSelectSelectedColor}
                                tagTextColor={config.colors.multiSelectSelectedColor}
                                submitButtonColor={config.colors.btnColor}
                                submitButtonText='Update Status Filter'
                            />
                            : <View style={{
                                flex: -1, justifyContent: "center",
                                alignContent: "center", padding: 20
                            }}>
                                <ActivityIndicator color={config.colors.loadingColor} size='large' />
                            </View>
                        }
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => {
                        this.props.onApplyFilter(this.state.selectedOrderStatuses)
                        this.setState({
                            filterModalShown: false
                        })
                    }}
                >
                    <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
            </Modal>
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
    },
    h2Text: {
        fontWeight: 'bold',
    },
    filterBtn: {
        backgroundColor: config.colors.btnColor,
        height: 40
    },
    filterBtnText: {
        color: config.colors.btnTextColor,
        fontWeight: 'bold',
        marginLeft: 5
    },
    applyBtn: {
        backgroundColor: config.colors.btnColor,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    applyBtnText: {
        color: config.colors.btnTextColor,
        fontWeight: 'bold',
    }
});