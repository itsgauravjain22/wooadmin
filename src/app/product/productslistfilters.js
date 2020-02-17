import React, { Component } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, ScrollView, ToastAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RadioButtons from '../commoncomponents/radiobuttons'
import * as SecureStore from 'expo-secure-store';

const config = require('../../../config.json');

export default class ProductsListFilters extends Component {

    constructor(props) {
        super(props);
        this.state = {
            base_url: null,
            c_key: null,
            c_secret: null,
            filterModalShown: false,
            productStatusOptions: [
                ['any', 'Any'],
                ['draft', 'Draft'],
                ['pending', 'Pending'],
                ['private', 'Private'],
                ['publish', 'Publish']
            ],
            selectedProductStatus: 'any',
            productCategoriesPage: 1,
            hasMoreProductCategoriesToLoad: true,
            productCategories: [],
            selectedProductCategory: '0',
            productStockStatusOptions: [
                ['none', 'None'],
                ['instock', 'In Stock'],
                ['outofstock', 'Out Of Stock'],
                ['onbackorder', 'On BackOrder']
            ],
            selectedProductStockStatus: 'none'
        }
        this._isMounted = false
    }

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await this.getCredentials();
        this._isMounted && this.fetchAllProductCategories()
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

    //Fetch Products Categories

    fetchAllProductCategories = () => {
        const { base_url, c_key, c_secret } = this.state;
        const url = `${base_url}/wp-json/wc/v3/products/categories?per_page=20&page=${this.state.productCategoriesPage}&consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                if (Array.isArray(responseJson) && responseJson.length > 0 && 'id' in responseJson[0]) {
                    let productCategoriesData = []
                    productCategoriesData.push([0, 'None'])
                    responseJson.forEach((item) => {
                        productCategoriesData.push([item.id.toString(), item.name])
                    })
                    this.setState({
                        hasMoreProductCategoriesToLoad: true,
                        productCategoriesPage: this.state.productCategoriesPage + 1,
                        productCategories: this.state.productCategories.concat(productCategoriesData)
                    }, this.fetchAllProductCategories);
                } else if (Array.isArray(responseJson) && responseJson.length === 0) {
                    this.setState({
                        hasMoreProductCategoriesToLoad: false
                    })
                } else if ('code' in responseJson) {
                    this.setState({
                        error: responseJson.code,
                        loading: false
                    })
                    ToastAndroid.show("Can't fetch Product Categories. Error: " + responseJson.code, ToastAndroid.LONG)
                }
            }).catch((error) => {
                ToastAndroid.show("Can't fetch Product Categories. Error: " + error, ToastAndroid.LONG)
                this.setState({
                    error,
                })
            });
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
                <ScrollView style={{ flex: 1 }}>
                    <View style={styles.section}>
                        <Text style={styles.titleText}>Filter By</Text>
                        <View style={styles.subSection}>
                            <Text style={styles.h2Text}>Product Status</Text>
                            <RadioButtons
                                options={this.state.productStatusOptions}
                                value={this.state.selectedProductStatus}
                                selectedValue={(selectedValue) => {
                                    this.setState({
                                        selectedProductStatus: selectedValue
                                    })
                                }}
                            />
                        </View>
                        <View style={styles.subSection}>
                            <Text style={styles.h2Text}>Product Stock Status</Text>
                            <RadioButtons
                                options={this.state.productStockStatusOptions}
                                value={this.state.selectedProductStockStatus}
                                selectedValue={(selectedValue) => {
                                    this.setState({
                                        selectedProductStockStatus: selectedValue
                                    })
                                }}
                            />
                        </View>
                        <View style={styles.subSection}>
                            <Text style={styles.h2Text}>Product Categories</Text>
                            {!this.state.hasMoreProductCategoriesToLoad
                                ? <RadioButtons
                                    options={this.state.productCategories}
                                    value={this.state.selectedProductCategory}
                                    selectedValue={(selectedValue) => {
                                        this.setState({
                                            selectedProductCategory: selectedValue
                                        })
                                    }}
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
                </ScrollView>
                <TouchableOpacity
                    style={styles.applyBtn}
                    onPress={() => {
                        this.props.onApplyFilter({
                            "productStatus": this.state.selectedProductStatus,
                            "productCategory": this.state.selectedProductCategory,
                            "productStockStatus": this.state.selectedProductStockStatus
                        })
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
    subSection: {
        marginTop: 15,
        marginLeft: 25,
        marginRight: 25
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