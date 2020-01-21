import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default class ProductsList extends Component {

    static navigationOptions = {
        headerTitle: 'Products',
        headerStyle: {
            backgroundColor: '#96588a',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            page: 1,
            seed: 1,
            error: null,
            refreshing: false,
            base_url: null,
            c_key: null,
            c_secret: null,
        };
    }

    async componentDidMount() {
        await this.getCredentials();
        this.fetchProductList();
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
        const { base_url, c_key, c_secret, page } = this.state;
        const url = `${base_url}/wp-json/wc/v3/products?per_page=20&page=${page}&consumer_key=${c_key}&consumer_secret=${c_secret}`;
        this.setState({ loading: true });
        setTimeout(() => {
            fetch(url).then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        data: [...this.state.data, ...responseJson],
                        error: responseJson.error || null,
                        loading: false,
                        refreshing: false
                    });
                    // this.state.data.forEach(item => console.log(`${item.sku}: ${item.stock_quantity}`))
                }).catch((error) => {
                    this.setState({
                        error,
                        loading: false,
                        refreshing: false
                    })
                });
        }, 1500);
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
                <ActivityIndicator color='#96588a' size='large' />
            </View>
        )
    }

    handleRefresh = () => {
        this.setState(
            {
                page: 1,
                refreshing: true,
                seed: this.state.seed + 1,
            },
            () => {
                this.fetchProductList();
            }
        )
    }

    handleLoadMore = () => {
        this.setState(
            {
                page: this.state.page + 1,
            },
            () => {
                this.fetchProductList();
            }
        )
    }

    render() {
        return (
            <FlatList
                data={this.state.data}
                keyExtractor={item => item.id.toString()}
                refreshing={this.state.refreshing}
                extraData={this.state}
                onRefresh={this.handleRefresh}
                onEndReached={this.handleLoadMore}
                onEndReachedThreshold={100}
                ItemSeparatorComponent={this.renderListSeparator}
                ListFooterComponent={this.renderListFooter}
                renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate('ProductDetails', {
                            productId: item.id,
                            productName: item.name,
                            productData: item,
                            base_url: this.state.base_url,
                            c_key: this.state.c_key,
                            c_secret: this.state.c_secret
                        });
                    }}>
                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                            <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
                                <Image source={(Array.isArray(item.images) && item.images.length) ?
                                    { uri: item.images[0].src } :
                                    require('../../../assets/images/blank_product.png')}
                                    onError={(e) => { this.props.source = require('../../../assets/images/blank_product.png') }}
                                    style={{ height: 115, width: 115 }} resizeMode='contain' />
                            </View>
                            <View style={{ flex: 2, marginTop: 10, marginBottom: 10, justifyContent: "center" }}>
                                <View style={{ marginLeft: 10 }}>
                                    <Text style={styles.titleText}>{item.name}</Text>
                                    <Text>SKU: {item.sku}</Text>
                                    <Text>Price: {item.price}</Text>
                                    <Text>Stock Status:  {item.stock_status}</Text>
                                    <Text>Stock: {item.stock_quantity}</Text>
                                    <Text>Status: {item.status}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                }
            />
        );
    }
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
    }
});
