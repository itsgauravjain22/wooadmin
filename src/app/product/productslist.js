import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import GLOBAL from './productglobal'
import { Ionicons } from '@expo/vector-icons';
import SearchBar from '../commoncomponents/searchbar'
import ProductsListFilters from './productslistfilters';

const config = require('../../../config.json');

export default class ProductsList extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Products',
            headerRight: () => (
                <TouchableOpacity
                    style={{ paddingRight: 20 }}
                    onPress={() => { navigation.navigate("Settings") }}
                >
                    <Ionicons name='md-more' size={25} color={config.colors.iconLightColor} />
                </TouchableOpacity>
            ),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            hasMoreToLoad: true,
            searchValue: '',
            productStatusFilter: 'any',
            productCategory: '0',
            productStockStatusFilter: 'none',
            data: [],
            page: 1,
            error: null,
            refreshing: false,
            base_url: null,
            c_key: null,
            c_secret: null,
        };
        GLOBAL.productslistScreen = this;
        this._isMounted = false;
    }

    async componentDidMount() {
        this._isMounted = true;
        this._isMounted && await this.getCredentials();
        this._isMounted && this.fetchProductList();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <SearchBar onSearchPress={this.handleSearch}></SearchBar>
                <ProductsListFilters onApplyFilter={this.handleProductsFilter}></ProductsListFilters>
                <FlatList
                    data={this.state.data}
                    keyExtractor={item => item.id.toString()}
                    refreshing={this.state.refreshing}
                    extraData={this.state.data}
                    onRefresh={this.handleRefresh}
                    onEndReached={this.state.hasMoreToLoad ? this.handleLoadMore : null}
                    onEndReachedThreshold={0.5}
                    ItemSeparatorComponent={this.renderListSeparator}
                    ListFooterComponent={this.renderListFooter}
                    renderItem={this.renderItem}
                />
                {this.displayAddProductButton()}
            </View>
        );
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

    fetchProductList = () => {
        const { base_url, c_key, c_secret, page, searchValue, productStatusFilter, productCategoryFilter, productStockStatusFilter } = this.state;
        let url = `${base_url}/wp-json/wc/v3/products?per_page=20&page=${page}&consumer_key=${c_key}&consumer_secret=${c_secret}`
        if (searchValue) {
            url = url.concat(`&search=${searchValue}`)
        }
        if (productStatusFilter) {
            url = url.concat(`&status=${productStatusFilter}`)
        }
        if (productCategoryFilter && productCategoryFilter !== '0') {
            url = url.concat(`&category=${productCategoryFilter}`)
        }
        if (productStockStatusFilter && productStockStatusFilter !== 'none') {
            url = url.concat(`&stock_status=${productStockStatusFilter}`)
        }
        this.setState({ loading: true });
        fetch(url).then((response) => response.json())
            .then((responseJson) => {
                if (Array.isArray(responseJson) && responseJson.length) {
                    this.setState({
                        hasMoreToLoad: true,
                        data: this.state.data.concat(responseJson),
                        error: responseJson.code || null,
                        loading: false,
                        refreshing: false
                    });
                } else {
                    this.setState({
                        hasMoreToLoad: false,
                        error: responseJson.code || null,
                        loading: false,
                        refreshing: false
                    });
                }
            }).catch((error) => {
                this.setState({
                    hasMoreToLoad: false,
                    error,
                    loading: false,
                    refreshing: false
                })
            });
    };

    renderListSeparator = () => {
        return (
            <View style={{
                height: 1,
                width: '100%',
                backgroundColor: '#999999'
            }} />
        )
    }

    renderListFooter = () => {
        if (!this.state.loading) return null;

        return (
            <View style={{
                paddingVertical: 20,
            }}>
                <ActivityIndicator color={config.colors.loadingColor} size='large' />
            </View>
        )
    }

    handleRefresh = () => {
        this.setState({
            page: 1,
            refreshing: true,
            data: []
        }, () => {
            this.fetchProductList();
        }
        )
    }

    handleLoadMore = () => {
        this.setState({
            page: this.state.page + 1,
        }, () => {
            this.fetchProductList();
        })
    }

    handleSearch = (value) => {
        this._isMounted && this.setState({
            searchValue: value,
            page: 1,
            refreshing: true,
            data: []
        }, () => {
            this.fetchProductList()
        })
    }

    handleProductsFilter = (value) => {
        this.setState({
            productStatusFilter: value.productStatus,
            productCategoryFilter: value.productCategory,
            productStockStatusFilter: value.productStockStatus,
            page: 1,
            refreshing: true,
            data: []
        }, () => {
            this.fetchProductList()
        })
    }

    renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => {
                if (config.permissions.products.view) {
                    this.props.navigation.navigate('ProductDetails', {
                        productId: item.id,
                        productName: item.name
                    });
                }
            }}>
                <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        {(Array.isArray(item.images) && item.images.length)
                            ? <Image
                                source={{ uri: item.images[0].src }}
                                style={{ height: 115, width: 115 }}
                                resizeMode='contain'
                            />
                            : <Ionicons name='logo-dropbox' size={100} color={config.colors.iconLightColor} />
                        }
                    </View>
                    <View style={{ flex: 2, marginTop: 10, marginBottom: 10, justifyContent: "center" }}>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.titleText}>{item.name}</Text>
                            <Text>SKU: {item.sku}</Text>
                            <Text>Price: {item.price}</Text>
                            <Text>Stock Status: {item.stock_status}</Text>
                            <Text>Stock: {item.stock_quantity}</Text>
                            <Text>Status: {item.status}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    //Display Functions Below

    displayAddProductButton = () => {
        if (config.permissions.products.add) {
            return (
                <TouchableOpacity
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 50,
                        backgroundColor: config.colors.btnColor
                    }}
                    onPress={() => {
                        this.props.navigation.navigate('AddProduct')
                    }}
                >
                    <Text style={{
                        color: config.colors.btnTextColor,
                        fontWeight: 'bold'
                    }}>
                        Add Product
                    </Text>
                </TouchableOpacity >
            )
        } else return <></>
    }
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
    }
});
