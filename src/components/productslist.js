import React, { Component } from 'react';
import { StyleSheet, Text, View, FlatList, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import Base64 from '../utility/base64';
import SingleProduct from './singleproduct';

export class ProductsList extends Component {

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
            refreshing: false
        };
    }

    componentDidMount() {
        this.fetchProductList();
    }

    fetchProductList = () => {
        const { page } = this.state;
        const url = `https://www.kalashcards.com/wp-json/wc/v3/products?per_page=20&page=${page}`;
        this.setState({ loading: true });
        setTimeout(() => {
            fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + Base64.btoa('ck_20d0fd1bf4b32534250b69076ca57ac75cf51662:cs_76e01499543ded3f5ecd82d9e762d4fa1680c862'),
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }).then((response) => response.json())
                .then((responseJson) => {
                    this.setState({
                        data: [...this.state.data, ...responseJson],
                        error: responseJson.error || null,
                        loading: false,
                        refreshing: false
                    });
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
                seed: this.state.seed + 1
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
                keyExtractor={item => item.id}
                refreshing={this.state.refreshing}
                onRefresh={this.handleRefresh}
                onEndReached={this.handleLoadMore}
                onEndReachedThreshold={100}
                ItemSeparatorComponent={this.renderListSeparator}
                ListFooterComponent={this.renderListFooter}
                renderItem={({ item }) =>
                    <TouchableOpacity onPress={() => {
                        this.props.navigation.navigate('SingleProduct', {
                            productId: item.id,
                            productName: item.name,
                            productData: item
                        });
                    }}>
                        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
                            <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
                                <Image source={(Array.isArray(item.images) && item.images.length) ?
                                    { uri: item.images[0].src } :
                                    require('../../assets/images/blank_product.png')}
                                    onError={(e) => { this.props.source = require('../../assets/images/blank_product.png') }}
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

const AppNavigator = createStackNavigator({
    Products: ProductsList,
    SingleProduct: SingleProduct
},{
    initialRouteName: 'Products',
});

export default createAppContainer(AppNavigator);